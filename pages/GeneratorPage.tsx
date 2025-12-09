import React, { useState } from 'react';
import { Type } from '@google/genai';
import * as Cards from 'character-card-utils';
import TextBox from '../components/TextBox';
import InteractiveCard from '../components/InteractiveCard';
import { embedCardInPng, readCardFromPng } from '../utils/pngEmbedder';
import { setIn } from '../utils/immutableUpdate';
import { generateContent } from '../utils/aiService';
import { useSettings } from '../contexts/SettingsContext';

// Define a response schema for the V2 character card to get structured JSON output.
const cardSchema = {
  type: Type.OBJECT,
  properties: {
    spec: { type: Type.STRING, description: "Must be 'chara_card_v2'." },
    spec_version: { type: Type.STRING, description: "Must be '2.0'." },
    data: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The character's name." },
        description: { type: Type.STRING, description: "A detailed physical and psychological description of the character. Use {{char}} for the character's name." },
        personality: { type: Type.STRING, description: "A description of the character's personality traits and quirks." },
        scenario: { type: Type.STRING, description: "The context or setting where the user will interact with the character." },
        first_mes: { type: Type.STRING, description: "The first message the character says to the user to start the conversation." },
        mes_example: { 
            type: Type.STRING, 
            description: "Example conversations. It MUST be expected that botmakers format example conversations like this: <START> {{user}}: hi {{char}}: hello. <START> marks the beginning of a new conversation." 
        },
        creator_notes: { type: Type.STRING, description: "Notes from the creator about how to portray the character." },
        system_prompt: { type: Type.STRING, description: "Instructions for the AI model on how to behave during roleplay." },
        post_history_instructions: { type: Type.STRING, description: "Instructions applied after chat history is loaded." },
        alternate_greetings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of alternative first messages."
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Keywords to categorize the character."
        },
        creator: { type: Type.STRING, description: "The name of the card's author." },
        character_version: { type: Type.STRING, description: "Version number for this character card." },
      },
    },
  },
  required: ['spec', 'spec_version', 'data']
};

const GeneratorPage: React.FC = () => {
    const { useCustomEndpoint, customApiUrl, customApiKey, customModel } = useSettings();
    const [prompt, setPrompt] = useState('');
    const [card, setCard] = useState<Cards.V2 | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [regeneratingField, setRegeneratingField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pngFile, setPngFile] = useState<File | null>(null);

    const getAIConfig = () => ({
        useCustomEndpoint,
        customApiUrl,
        customApiKey,
        customModel,
        defaultGeminiKey: import.meta.env.VITE_GEMINI_API_KEY
    });

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        
        setIsLoading(true);
        setError(null);
        setCard(null);
        setPngFile(null);
        
        try {
            let importedData;
            if (file.name.toLowerCase().endsWith('.png')) {
                importedData = await readCardFromPng(file);
                // Pre-set the PNG file for re-export
                setPngFile(file);
            } else {
                const text = await file.text();
                importedData = JSON.parse(text);
            }
            
            // Validate V2 first
            const v2Validation = Cards.v2.safeParse(importedData);
            if (v2Validation.success) {
                setCard(v2Validation.data);
            } else {
                // Try V1 and convert
                const v1Validation = Cards.v1.safeParse(importedData);
                if (v1Validation.success) {
                    setCard(Cards.v1ToV2(v1Validation.data));
                } else {
                    // Try backfilling if it looks like V2 but missing fields
                     const looseValidation = Cards.v1.merge(Cards.v2).safeParse(importedData);
                     if (looseValidation.success) {
                         setCard(Cards.backfillV2(looseValidation.data));
                     } else {
                         throw new Error(`Invalid card format. Details: ${v2Validation.error.message}`);
                     }
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(`Failed to import card: ${err.message}`);
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleGenerate = async () => {
        if (!import.meta.env.VITE_GEMINI_API_KEY && !useCustomEndpoint) {
            setError('Gemini API key is not configured and custom endpoint is disabled. Please configure in Settings.');
            return;
        }
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a character.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCard(null);
        setPngFile(null);

        try {
            const systemInstruction = `You are an expert character card creator for dense, detailed, complete roleplaying chatbots.
            Your task is to generate a complete and detailed character card in the V2 JSON format based on the user's prompt.
            The JSON output must strictly adhere to the provided schema.
            Ensure all fields are populated with creative and relevant content.
            The 'spec' must be 'chara_card_v2' and 'spec_version' must be '2.0'.
            Do not include any text before or after the JSON object.
            
            IMPORTANT for mes_example:
            You MUST separate distinct conversations with <START> on a new line.
            Example:
            <START>
            {{user}}: Hello
            {{char}}: Hi there!
            <START>
            {{user}}: Bye
            {{char}}: See you.`;
            
            const generatedCard = await generateContent({
                prompt: `User prompt: "${prompt}"`,
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: cardSchema,
            }, getAIConfig());

            if (generatedCard.data) {
                generatedCard.data.extensions = {};
            }
            
            const validation = Cards.v2.safeParse(generatedCard);
            if (validation.success) {
                setCard(validation.data);
            } else {
                console.error("Generated card failed validation:", validation.error);
                setError(`The AI generated an invalid card structure. Please try again. Details: ${validation.error.message}`);
            }

        } catch (e: any) {
            console.error(e);
            setError(`An error occurred while generating the card: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (path: string, newValue: any) => {
        if (!card) return;
        const newCard = setIn(card, path, newValue);
        setCard(newCard);
    };

    const handleRegenerate = async (fieldPath: string) => {
        if (!card) return;

        setRegeneratingField(fieldPath);
        setError(null);

        try {
            const fieldName = fieldPath.split('.').pop() || '';
            const currentVal = (card.data as any)[fieldName];
            
            // Build Context based on strict Chain logic requested by user
            let contextData: any = {};
            const d = card.data;

            // Chain Logic:
            if (fieldName === 'personality') {
                contextData = { name: d.name, description: d.description };
            } else if (fieldName === 'scenario') {
                 contextData = { name: d.name, description: d.description, personality: d.personality };
            } else if (fieldName === 'first_mes') {
                 contextData = { name: d.name, description: d.description, personality: d.personality, scenario: d.scenario };
            } else if (fieldName === 'mes_example') {
                 contextData = { name: d.name, description: d.description, personality: d.personality, scenario: d.scenario, first_mes: d.first_mes };
            } else if (fieldName === 'description') {
                 contextData = { name: d.name };
            } else {
                contextData = { ...d };
                delete (contextData as any)[fieldName];
            }

            const systemInstruction = `You are an expert character card editor.
            You are regenerating the field "${fieldName}".
            
            ${fieldName === 'mes_example' ? 'IMPORTANT: You MUST use <START> on a new line to mark the beginning of each new conversation block. Use {{user}}: and {{char}}: to denote speakers.' : ''}

            INPUTS:
            1. CONTEXT: The character details you must be consistent with.
            2. CURRENT DRAFT: The user's current text for this field.

            INSTRUCTIONS:
            - Generate a new value for "${fieldName}".
            - CONSISTENCY: Your output must fit perfectly with the provided CONTEXT.
            - STEERING: If "CURRENT DRAFT" contains text, you MUST use it as the primary instruction and source material. Refine, expand, or format the user's draft while maintaining their intent.
            - CREATIVITY: If "CURRENT DRAFT" is empty or generic, generate creative content based strictly on the CONTEXT.
            - OUTPUT: Return a JSON object with a single key "${fieldName}".`;

            const prompt = `
            CONTEXT:
            ${JSON.stringify(contextData, null, 2)}

            CURRENT DRAFT:
            ${JSON.stringify(currentVal)}
            `;
            
            // Dynamic schema for single field
            let schemaProp: any = { type: Type.STRING };
            if (fieldName === 'tags' || fieldName === 'alternate_greetings') {
                schemaProp = {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                };
            }

            const fieldSchema = {
                type: Type.OBJECT,
                properties: {
                    [fieldName]: schemaProp
                },
                required: [fieldName]
            };

            const result = await generateContent({
                prompt,
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: fieldSchema,
            }, getAIConfig());

            if (result[fieldName] !== undefined) {
                 handleUpdate(fieldPath, result[fieldName]);
            } else {
                 throw new Error(`AI response missing key: ${fieldName}`);
            }

        } catch (e: any) {
            console.error(e);
            setError(`An error occurred while regenerating the field: ${e.message}`);
        } finally {
            setRegeneratingField(null);
        }
    };

    const handleDownloadJson = () => {
        if (!card) return;
        const jsonStr = JSON.stringify(card, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const name = card.data.name || 'character';
        link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPngFile(e.target.files[0]);
        }
    };

    const handleDownloadPng = async () => {
        if (!card || !pngFile) return;
        try {
            const newBlob = await embedCardInPng(pngFile, card);
            const url = URL.createObjectURL(newBlob);
            const link = document.createElement('a');
            link.href = url;
            const name = card.data.name || 'character';
            link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error(err);
            alert(`Failed to create PNG card. ${err.message}`);
        }
    };

    const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY || (useCustomEndpoint && customApiUrl);

    if (!hasApiKey) {
        return (
            <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                <h4 className="font-bold mb-2">Configuration Error</h4>
                <p>No API configuration found. Please check your environment variables or configure a Custom Endpoint in the <strong>Settings</strong> page.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                <h2 className="text-2xl font-semibold text-cyan-300">
                    AI Character Card Generator
                </h2>
                {useCustomEndpoint && (
                    <span className="text-xs font-mono bg-teal-900 text-teal-300 px-2 py-1 rounded border border-teal-700">
                        Using: {customModel || 'Custom API'}
                    </span>
                )}
            </div>
            
            <p className="mb-6 text-gray-400">
                Create new characters from scratch using AI, or import existing cards (JSON or PNG) to edit and refine them.
            </p>

            {/* Controls Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Generate New Section */}
                <div className="p-6 bg-gray-800/60 rounded-xl border border-gray-700 shadow-md flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Generate New
                    </h3>
                    <TextBox
                        value={prompt}
                        onChange={setPrompt}
                        placeholder="e.g., A grumpy old wizard who secretly loves kittens and runs a magical bakery."
                        heightClass="min-h-[120px] mb-4"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-auto w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-900/20"
                    >
                        {isLoading ? 'Generating...' : 'Generate Card'}
                    </button>
                </div>

                {/* Import Section */}
                <div className="p-6 bg-gray-800/60 rounded-xl border border-gray-700 shadow-md flex flex-col">
                     <h3 className="text-lg font-bold text-teal-300 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Import Existing
                    </h3>
                    <div className="flex-grow flex flex-col justify-center items-center border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-900/30 hover:bg-gray-900/50 hover:border-teal-500/50 transition-all cursor-pointer relative group">
                        <input 
                            type="file" 
                            accept=".json,.png" 
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-center pointer-events-none">
                            <svg className="mx-auto h-10 w-10 text-gray-500 group-hover:text-teal-400 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.414l5 5a1 1 0 01.414 1.414V19a2 2 0 01-2 2z"></path></svg>
                            <p className="text-gray-300 font-medium">Click or Drop File Here</p>
                            <p className="text-gray-500 text-xs mt-1">Supports V2 JSON or PNG Cards</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && !card && (
                <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-300 animate-pulse">Processing character data...</p>
                </div>
            )}
            
            {card && !isLoading && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-2 mt-8">
                        <h3 className="text-xl font-semibold text-cyan-400">Card Data</h3>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                            {card.data.name} (v{card.data.character_version})
                        </span>
                    </div>
                    
                    <InteractiveCard 
                        card={card} 
                        onRegenerate={handleRegenerate} 
                        regeneratingField={regeneratingField} 
                        onUpdate={handleUpdate}
                    />
                    
                    <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export Options
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col">
                                <h4 className="text-cyan-300 font-semibold mb-2">Format: JSON</h4>
                                <p className="text-gray-400 text-sm mb-4">Download the character data as a raw JSON file. Compatible with all card editors.</p>
                                <button 
                                    onClick={handleDownloadJson}
                                    className="mt-auto bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 border border-gray-600 hover:border-cyan-500 w-full md:w-auto flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download .json
                                </button>
                            </div>
                            
                            <div className="flex flex-col border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8">
                                <h4 className="text-cyan-300 font-semibold mb-2">Format: PNG Card</h4>
                                <p className="text-gray-400 text-sm mb-4">Embed the character data into a PNG image. This creates a "Character Card" loadable in roleplay frontends.</p>
                                
                                <div className="space-y-3 mt-auto">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Select Image (PNG only)
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <input 
                                                type="file" 
                                                accept="image/png" 
                                                onChange={handlePngUpload}
                                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-cyan-400 hover:file:bg-gray-600 cursor-pointer bg-gray-900/50 rounded-lg border border-gray-600 p-1"
                                            />
                                        </div>
                                    </div>
                                    {pngFile && (
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Ready: {pngFile.name}
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleDownloadPng}
                                        disabled={!pngFile}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        Download Embedded PNG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratorPage;