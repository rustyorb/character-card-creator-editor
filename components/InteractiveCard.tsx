
import React, { useState } from 'react';

interface InteractiveCardProps {
  card: any;
  onRegenerate: (fieldPath: string) => void;
  regeneratingField: string | null;
  onUpdate: (fieldPath: string, newValue: any) => void;
}

const regeneratableFields = new Set([
  'name', 'description', 'personality', 'scenario', 'first_mes', 'mes_example',
  'creator_notes', 'system_prompt', 'post_history_instructions',
  'alternate_greetings', 'tags'
]);

const RefreshIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CancelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CardRow: React.FC<{
  fieldKey: string;
  value: any;
  path: string;
  onRegenerate: (path: string) => void;
  onUpdate: (path: string, value: any) => void;
  isRegenerating: boolean;
  isRegeneratable: boolean;
}> = ({ fieldKey, value, path, onRegenerate, onUpdate, isRegenerating, isRegeneratable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const startEdit = () => {
        if (typeof value === 'string') {
            setEditValue(value);
        } else {
            setEditValue(JSON.stringify(value, null, 2));
        }
        setIsEditing(true);
        setError(null);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditValue('');
        setError(null);
    };

    const saveEdit = () => {
        let newValue: any;
        if (typeof value === 'string') {
            newValue = editValue;
        } else {
            try {
                newValue = JSON.parse(editValue);
            } catch (e: any) {
                setError(`Invalid JSON: ${e.message}`);
                return;
            }
        }
        onUpdate(path, newValue);
        setIsEditing(false);
        setError(null);
    };

    return (
        <div className="flex group items-start font-mono text-sm py-3 border-b border-gray-800">
            <div className="flex-shrink-0 w-32 sm:w-48 text-right pr-4 pt-1">
                <span className="text-purple-400 font-semibold break-all">"{fieldKey}"</span>:
            </div>
            
            <div className="flex-grow min-w-0 pr-4">
                {isEditing ? (
                    <div className="w-full">
                        <textarea 
                            className="w-full bg-gray-800 text-gray-200 p-2 rounded border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono leading-relaxed"
                            rows={typeof value === 'string' && value.length > 100 ? 10 : 3}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                        />
                        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
                        <div className="flex gap-2 mt-2 justify-end">
                            <button onClick={saveEdit} className="flex items-center gap-1 text-green-400 hover:text-green-300 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                <SaveIcon /> <span className="text-xs">Save</span>
                            </button>
                            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-400 hover:text-red-300 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                <CancelIcon /> <span className="text-xs">Cancel</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-green-300 whitespace-pre-wrap break-words">
                        {typeof value === 'string' ? `"${value}"` : JSON.stringify(value, null, 2)}
                    </div>
                )}
            </div>

            <div className="w-20 flex-shrink-0 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                {!isEditing && (
                    <>
                        <button
                            onClick={startEdit}
                            disabled={isRegenerating}
                            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                            title="Edit manually"
                            aria-label={`Edit ${fieldKey}`}
                        >
                            <EditIcon />
                        </button>
                        {isRegeneratable && (
                            <button
                                onClick={() => onRegenerate(path)}
                                disabled={isRegenerating}
                                className="p-1 text-gray-400 hover:text-cyan-400 disabled:text-gray-600 transition-colors"
                                title="Regenerate with AI"
                                aria-label={`Regenerate ${fieldKey}`}
                            >
                                {isRegenerating ? <SpinnerIcon /> : <RefreshIcon />}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};


const InteractiveCard: React.FC<InteractiveCardProps> = ({ card, onRegenerate, regeneratingField, onUpdate }) => {
  if (!card || !card.data) return null;

  return (
    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 mt-2 overflow-x-auto">
      <div className="font-mono text-sm">
        <div className="py-1.5"><span className="text-purple-400">"spec"</span>: <span className="text-green-300">"{card.spec}"</span>,</div>
        <div className="py-1.5"><span className="text-purple-400">"spec_version"</span>: <span className="text-green-300">"{card.spec_version}"</span>,</div>
        <div className="py-1.5"><span className="text-purple-400">"data"</span>: &#123;</div>
        <div className="pl-0 sm:pl-6 border-l-0 sm:border-l-2 border-gray-700">
            {Object.entries(card.data).map(([key, value]) => {
                const fieldPath = `data.${key}`;
                return (
                    <CardRow
                        key={key}
                        fieldKey={key}
                        value={value}
                        path={fieldPath}
                        onRegenerate={onRegenerate}
                        onUpdate={onUpdate}
                        isRegenerating={regeneratingField === fieldPath}
                        isRegeneratable={regeneratableFields.has(key)}
                    />
                );
            })}
        </div>
        <div className="py-1.5">&#125;</div>
      </div>
    </div>
  );
};

export default InteractiveCard;
