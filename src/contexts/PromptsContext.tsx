
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PromptsState {
  generatorSystemPrompt: string;
  setGeneratorSystemPrompt: (v: string) => void;
  regeneratorSystemPrompt: string;
  setRegeneratorSystemPrompt: (v: string) => void;
  resetPrompts: () => void;
}

const PromptsContext = createContext<PromptsState | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  GENERATOR_PROMPT: 'ccu_generator_prompt',
  REGENERATOR_PROMPT: 'ccu_regenerator_prompt',
};

export const DEFAULT_GENERATOR_PROMPT = `You are an expert character card creator for dense, detailed, complete roleplaying chatbots.
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

export const DEFAULT_REGENERATOR_PROMPT = `You are an expert character card editor.
You are regenerating the field "{{fieldName}}".

{{mesExampleInstruction}}

INPUTS:
1. CONTEXT: The character details you must be consistent with.
2. CURRENT DRAFT: The user's current text for this field.

INSTRUCTIONS:
- Generate a new value for "{{fieldName}}".
- CONSISTENCY: Your output must fit perfectly with the provided CONTEXT.
- STEERING: If "CURRENT DRAFT" contains text, you MUST use it as the primary instruction and source material. Refine, expand, or format the user's draft while maintaining their intent.
- CREATIVITY: If "CURRENT DRAFT" is empty or generic, generate creative content based strictly on the CONTEXT.
- OUTPUT: Return a JSON object with a single key "{{fieldName}}".`;

export const PromptsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatorSystemPrompt, setGeneratorSystemPrompt] = useState(DEFAULT_GENERATOR_PROMPT);
  const [regeneratorSystemPrompt, setRegeneratorSystemPrompt] = useState(DEFAULT_REGENERATOR_PROMPT);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedGen = localStorage.getItem(LOCAL_STORAGE_KEYS.GENERATOR_PROMPT);
    const savedRegen = localStorage.getItem(LOCAL_STORAGE_KEYS.REGENERATOR_PROMPT);

    if (savedGen) setGeneratorSystemPrompt(savedGen);
    if (savedRegen) setRegeneratorSystemPrompt(savedRegen);
  }, []);

  const updateGeneratorPrompt = (val: string) => {
    setGeneratorSystemPrompt(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GENERATOR_PROMPT, val);
  };

  const updateRegeneratorPrompt = (val: string) => {
    setRegeneratorSystemPrompt(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REGENERATOR_PROMPT, val);
  };

  const resetPrompts = () => {
    updateGeneratorPrompt(DEFAULT_GENERATOR_PROMPT);
    updateRegeneratorPrompt(DEFAULT_REGENERATOR_PROMPT);
  };

  return (
    <PromptsContext.Provider
      value={{
        generatorSystemPrompt,
        setGeneratorSystemPrompt: updateGeneratorPrompt,
        regeneratorSystemPrompt,
        setRegeneratorSystemPrompt: updateRegeneratorPrompt,
        resetPrompts
      }}
    >
      {children}
    </PromptsContext.Provider>
  );
};

export const usePrompts = () => {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
};
