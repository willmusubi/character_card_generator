import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, AIProvider, DEFAULT_SETTINGS, PROVIDER_CONFIGS } from '../types/settings';

interface SettingsStore {
  settings: AppSettings;
  demoMode: boolean;
  inviteCode: string;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setProvider: (provider: AIProvider) => void;
  resetSettings: () => void;
  isConfigured: () => boolean;
  setDemoMode: (enabled: boolean, code?: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      demoMode: false,
      inviteCode: '',

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
        set({ settings: DEFAULT_SETTINGS, demoMode: false, inviteCode: '' });
      },

      isConfigured: () => {
        const { settings } = get();
        return settings.apiKey.trim().length > 0;
      },

      setDemoMode: (enabled, code) => {
        set({
          demoMode: enabled,
          inviteCode: code || '',
        });
      },
    }),
    {
      name: 'mufy-ai-settings',
      version: 2,  // 升级版本以触发迁移
    }
  )
);
