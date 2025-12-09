
import React from 'react';
import { usePrompts, DEFAULT_GENERATOR_PROMPT, DEFAULT_REGENERATOR_PROMPT } from '../contexts/PromptsContext';

const PromptsPage: React.FC = () => {
  const {
    generatorSystemPrompt,
    setGeneratorSystemPrompt,
    regeneratorSystemPrompt,
    setRegeneratorSystemPrompt,
    resetPrompts
  } = usePrompts();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all prompts to default?')) {
      resetPrompts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-2">
        <h2 className="text-2xl font-semibold text-purple-300">
          Prompt Engineering
        </h2>
        <button
          onClick={handleReset}
          className="bg-red-900/50 hover:bg-red-800 text-red-300 text-sm px-3 py-1.5 rounded border border-red-800 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="space-y-8">
        {/* Generator Prompt */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-6 shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-cyan-300 mb-1">Character Generator System Prompt</h3>
            <p className="text-gray-400 text-sm">
              This instruction is sent to the LLM when generating a new character from scratch.
            </p>
          </div>

          <textarea
            value={generatorSystemPrompt}
            onChange={(e) => setGeneratorSystemPrompt(e.target.value)}
            className="w-full h-64 bg-gray-900 text-gray-300 border border-gray-600 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-y"
            placeholder={DEFAULT_GENERATOR_PROMPT}
          />
          <p className="text-gray-500 text-xs mt-2 text-right">
             Changes are saved automatically.
          </p>
        </div>

        {/* Regenerator Prompt */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-6 shadow-md">
           <div className="mb-4">
            <h3 className="text-lg font-bold text-teal-300 mb-1">Field Regenerator System Prompt</h3>
            <p className="text-gray-400 text-sm">
              Used when clicking the "Regenerate" button on specific fields.
              Supports handlebars-style variables: <code>{'{{fieldName}}'}</code> and <code>{'{{mesExampleInstruction}}'}</code>.
            </p>
          </div>

          <textarea
            value={regeneratorSystemPrompt}
            onChange={(e) => setRegeneratorSystemPrompt(e.target.value)}
             className="w-full h-64 bg-gray-900 text-gray-300 border border-gray-600 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-y"
             placeholder={DEFAULT_REGENERATOR_PROMPT}
          />
          <p className="text-gray-500 text-xs mt-2 text-right">
             Changes are saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromptsPage;
