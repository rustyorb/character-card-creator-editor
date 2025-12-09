
const crcTable = new Uint32Array(256);

// Precompute CRC table
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = crcTable[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

function utf8ToB64(str: string): string {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64ToUtf8(str: string): string {
  return decodeURIComponent(escape(window.atob(str)));
}

export async function readCardFromPng(file: File): Promise<any> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Signature check
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
     if (bytes[i] !== signature[i]) throw new Error("Invalid PNG signature");
  }

  let pos = 8;
  const decoder = new TextDecoder();
  
  while (pos < bytes.length) {
      if (pos + 8 > bytes.length) break;
      const len = new DataView(bytes.buffer).getUint32(pos, false);
      const type = decoder.decode(bytes.slice(pos + 4, pos + 8));
      
      if (type === 'tEXt') {
          const dataStart = pos + 8;
          const dataEnd = dataStart + len;
          const data = bytes.slice(dataStart, dataEnd);
          
          // tEXt format: keyword + null + text
          let nullIndex = -1;
          for(let k=0; k<data.length; k++) {
              if (data[k] === 0) {
                  nullIndex = k;
                  break;
              }
          }
          
          if (nullIndex !== -1) {
              const keyword = decoder.decode(data.slice(0, nullIndex));
              if (keyword === 'chara') {
                  const textBytes = data.slice(nullIndex + 1);
                  const base64Content = decoder.decode(textBytes);
                  try {
                      const jsonStr = b64ToUtf8(base64Content);
                      return JSON.parse(jsonStr);
                  } catch (e) {
                      console.error("Error parsing chara chunk", e);
                  }
              }
          }
      }
      
      pos += 12 + len;
  }
  
  throw new Error("No 'chara' chunk found in PNG");
}

export async function embedCardInPng(imageFile: File, cardData: any): Promise<Blob> {
  const buffer = await imageFile.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== signature[i]) {
      throw new Error("Invalid PNG file signature");
    }
  }

  // Create tEXt chunk
  // Format: "chara" + null + base64(json)
  const keyword = "chara";
  const jsonStr = JSON.stringify(cardData);
  const base64Content = utf8ToB64(jsonStr);
  
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const contentBytes = encoder.encode(base64Content);
  const nullByte = new Uint8Array([0]);
  
  // Data part of the chunk
  const dataLen = keywordBytes.length + 1 + contentBytes.length;
  const chunkData = new Uint8Array(dataLen);
  chunkData.set(keywordBytes, 0);
  chunkData.set(nullByte, keywordBytes.length);
  chunkData.set(contentBytes, keywordBytes.length + 1);
  
  // Chunk type
  const typeBytes = encoder.encode("tEXt");
  
  // Calculate CRC on Type + Data
  const crcInput = new Uint8Array(typeBytes.length + chunkData.length);
  crcInput.set(typeBytes, 0);
  crcInput.set(chunkData, typeBytes.length);
  const crcValue = crc32(crcInput);
  
  // Construct full chunk: Length (4) + Type (4) + Data + CRC (4)
  const chunkLen = chunkData.length;
  const fullChunk = new Uint8Array(4 + 4 + chunkLen + 4);
  const view = new DataView(fullChunk.buffer);
  
  view.setUint32(0, chunkLen, false); // Length (big-endian)
  fullChunk.set(typeBytes, 4);        // Type
  fullChunk.set(chunkData, 8);        // Data
  view.setUint32(8 + chunkLen, crcValue, false); // CRC (big-endian)

  // Insert after IHDR
  // IHDR is mandatory first chunk. 
  // We scan chunks to find the end of IHDR.
  
  let pos = 8;
  let insertPos = -1;
  
  while (pos < bytes.length) {
    const len = new DataView(bytes.buffer).getUint32(pos, false);
    const type = new TextDecoder().decode(bytes.slice(pos + 4, pos + 8));
    
    // Chunk total size = 4 (len) + 4 (type) + len + 4 (crc)
    const nextPos = pos + 12 + len;
    
    if (type === 'IHDR') {
      insertPos = nextPos;
      break;
    }
    
    pos = nextPos;
  }
  
  if (insertPos === -1) {
    // If IHDR not found (unlikely in valid PNG), defaulting to after signature
    insertPos = 8;
  }

  // Create new file bytes
  const newBytes = new Uint8Array(bytes.length + fullChunk.length);
  newBytes.set(bytes.slice(0, insertPos), 0);
  newBytes.set(fullChunk, insertPos);
  newBytes.set(bytes.slice(insertPos), insertPos + fullChunk.length);
  
  return new Blob([newBytes], { type: 'image/png' });
}
