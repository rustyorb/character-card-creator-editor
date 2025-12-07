
import { GoogleGenAI } from '@google/genai';

interface GenerationParams {
  prompt: string;
  systemInstruction: string;
  responseSchema?: any;
  responseMimeType?: string;
}

interface AIConfig {
  useCustomEndpoint: boolean;
  customApiUrl: string;
  customApiKey: string;
  customModel: string;
  defaultGeminiKey?: string;
}

export const generateContent = async (params: GenerationParams, config: AIConfig): Promise<any> => {
  if (config.useCustomEndpoint) {
    return generateWithOpenAICompatible(params, config);
  } else {
    return generateWithGemini(params, config);
  }
};

const generateWithGemini = async (params: GenerationParams, config: AIConfig) => {
  if (!config.defaultGeminiKey) {
    throw new Error('Gemini API Key is missing. Please set API_KEY in environment or configure a custom endpoint in Settings.');
  }

  const ai = new GoogleGenAI({ apiKey: config.defaultGeminiKey });
  
  // Clean up schema for Gemini if needed, though usually passing the object is fine.
  // The SDK expects specific Type enums. Assuming the caller passes a valid schema object.
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: params.responseMimeType,
      responseSchema: params.responseSchema,
    },
  });

  const jsonString = response.text;
  if (!jsonString) throw new Error("Empty response from Gemini");
  return JSON.parse(jsonString);
};

const generateWithOpenAICompatible = async (params: GenerationParams, config: AIConfig) => {
  if (!config.customApiUrl) throw new Error("Custom API URL is missing.");
  
  // Ensure URL ends with /chat/completions if not provided
  let endpoint = config.customApiUrl;
  if (!endpoint.endsWith('/v1/chat/completions') && !endpoint.endsWith('/chat/completions')) {
      // User might have provided just the base url like http://localhost:11434/v1
      if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
      endpoint = `${endpoint}/chat/completions`;
  }

  const messages = [
    { role: 'system', content: params.systemInstruction },
    { role: 'user', content: params.prompt }
  ];

  // OpenAI-compatible backends (like Ollama) often handle JSON schemas differently.
  // We will append the schema to the system prompt to be safe and robust across different backends.
  if (params.responseSchema) {
    const schemaString = JSON.stringify(params.responseSchema, null, 2);
    messages[0].content += `\n\nIMPORTANT: You must respond with valid JSON strictly adhering to the following schema:\n${schemaString}\n\nDo not include markdown formatting (like \`\`\`json) in the response, just the raw JSON.`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (config.customApiKey) {
    headers['Authorization'] = `Bearer ${config.customApiKey}`;
  }

  const body = {
    model: config.customModel || 'gpt-3.5-turbo', // Fallback if no model selected
    messages: messages,
    temperature: 0.7,
    // Enable JSON mode if supported by the provider. 
    // Many providers (Ollama, vLLM) support response_format: { type: "json_object" }
    response_format: { type: "json_object" }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices.length || !data.choices[0].message) {
    throw new Error("Invalid response format from API");
  }

  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    console.warn("Failed to parse JSON directly, attempting cleanup", content);
    // Simple cleanup for markdown code blocks if the model ignored instructions
    const cleaned = content.replace(/```json\n?|```/g, '');
    return JSON.parse(cleaned);
  }
};
