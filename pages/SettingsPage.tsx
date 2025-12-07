
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import TextBox from '../components/TextBox';

const SettingsPage: React.FC = () => {
  const { 
    useCustomEndpoint, setUseCustomEndpoint,
    customApiUrl, setCustomApiUrl,
    customApiKey, setCustomApiKey,
    customModel, setCustomModel
  } = useSettings();

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchModels = async () => {
    if (!customApiUrl) {
      setFetchError("Please enter an API URL first.");
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      // Construct URL for /v1/models
      let baseUrl = customApiUrl;
      if (baseUrl.endsWith('/chat/completions')) {
        baseUrl = baseUrl.replace('/chat/completions', '');
      }
      if (baseUrl.endsWith('/v1')) {
          // Keep as is
      } else if (!baseUrl.endsWith('/v1')) {
          // Try to guess base
          if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
          // If the user entered root (e.g. localhost:11434), append /v1
          // But strict OpenAI format usually expects the /v1 in the base for client config
          // Let's assume user inputs the base URL like 'http://localhost:11434/v1'
      }

      const endpoint = `${baseUrl}/models`; // Often http://localhost:11434/v1/models

      const headers: Record<string, string> = {};
      if (customApiKey) {
        headers['Authorization'] = `Bearer ${customApiKey}`;
      }

      const res = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);

      const data = await res.json();
      
      // OpenAI format: { object: "list", data: [{ id: "model-name" }, ...] }
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id).sort((a: string, b: string) => a.localeCompare(b));
        setAvailableModels(models);
        if (models.length > 0 && !customModel) {
            setCustomModel(models[0]);
        }
      } else {
        throw new Error("Unexpected response format: " + JSON.stringify(data));
      }
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const generateEnvSnippet = () => {
    return `REACT_APP_CUSTOM_API_URL=${customApiUrl}\nREACT_APP_CUSTOM_API_KEY=${customApiKey}\nREACT_APP_CUSTOM_MODEL=${customModel}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2 text-cyan-300">
        Settings
      </h2>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">API Configuration</h3>
            <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={useCustomEndpoint}
                        onChange={(e) => setUseCustomEndpoint(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300">Use Custom / OpenAI Compatible Endpoint</span>
                </label>
            </div>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 ${useCustomEndpoint ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Base API URL</label>
                <input 
                    type="text" 
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="e.g. http://localhost:11434/v1" 
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
                <p className="mt-1 text-xs text-gray-500">The base URL for the API. Should usually end in <code>/v1</code>.</p>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">API Key (Optional for local LLMs)</label>
                <input 
                    type="password" 
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-..." 
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
             </div>

             <div className="flex items-end gap-4">
                 <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Model Name</label>
                    {availableModels.length > 0 ? (
                        <select 
                            value={customModel} 
                            onChange={(e) => setCustomModel(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    ) : (
                        <input 
                            type="text" 
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="e.g. llama3" 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    )}
                 </div>
                 <button 
                    onClick={fetchModels}
                    disabled={isFetching}
                    className="bg-teal-700 hover:bg-teal-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-teal-600"
                 >
                    {isFetching ? 'Fetching...' : 'Fetch Models'}
                 </button>
             </div>

             {fetchError && (
                 <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm">
                     {fetchError}
                 </div>
             )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
        <h3 className="text-xl font-bold text-white mb-4">Local Environment</h3>
        <p className="text-gray-400 text-sm mb-4">
            Web browsers cannot write directly to your local file system for security reasons. 
            However, your settings above are saved in your browser's local storage.
            If you wish to save these for a local build configuration, copy the snippet below into a <code>.env</code> file.
        </p>
        <div className="relative">
            <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-green-300 border border-gray-700 font-mono">
                {generateEnvSnippet()}
            </pre>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
