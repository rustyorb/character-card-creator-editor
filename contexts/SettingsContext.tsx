
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsState {
  useCustomEndpoint: boolean;
  setUseCustomEndpoint: (v: boolean) => void;
  customApiUrl: string;
  setCustomApiUrl: (v: string) => void;
  customApiKey: string;
  setCustomApiKey: (v: string) => void;
  customModel: string;
  setCustomModel: (v: string) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USE_CUSTOM: 'ccu_use_custom',
  API_URL: 'ccu_api_url',
  API_KEY: 'ccu_api_key',
  MODEL: 'ccu_model',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedUseCustom = localStorage.getItem(LOCAL_STORAGE_KEYS.USE_CUSTOM);
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.API_URL);
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEYS.API_KEY);
    const savedModel = localStorage.getItem(LOCAL_STORAGE_KEYS.MODEL);

    if (savedUseCustom !== null) setUseCustomEndpoint(savedUseCustom === 'true');
    if (savedUrl) setCustomApiUrl(savedUrl);
    if (savedKey) setCustomApiKey(savedKey);
    if (savedModel) setCustomModel(savedModel);
  }, []);

  // Save changes to LocalStorage
  const updateUseCustom = (val: boolean) => {
    setUseCustomEndpoint(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USE_CUSTOM, String(val));
  };

  const updateUrl = (val: string) => {
    setCustomApiUrl(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_URL, val);
  };

  const updateKey = (val: string) => {
    setCustomApiKey(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_KEY, val);
  };

  const updateModel = (val: string) => {
    setCustomModel(val);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODEL, val);
  };

  return (
    <SettingsContext.Provider
      value={{
        useCustomEndpoint,
        setUseCustomEndpoint: updateUseCustom,
        customApiUrl,
        setCustomApiUrl: updateUrl,
        customApiKey,
        setCustomApiKey: updateKey,
        customModel,
        setCustomModel: updateModel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
