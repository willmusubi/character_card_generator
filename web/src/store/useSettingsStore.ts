import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, AIProvider, DEFAULT_SETTINGS, PROVIDER_CONFIGS } from '../types/settings';

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setProvider: (provider: AIProvider) => void;
  resetSettings: () => void;
  isConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      setProvider: (provider) => {
        const config = PROVIDER_CONFIGS[provider];
        set((state) => ({
          settings: {
            ...state.settings,
            provider,
            baseUrl: config.defaultBaseUrl,
            model: config.models[0],
            enableSearch: config.supportsSearch,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },

      isConfigured: () => {
        const { settings } = get();
        return settings.apiKey.trim().length > 0;
      },
    }),
    {
      name: 'mufy-ai-settings',
      version: 1,
    }
  )
);
