
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'fr';

export interface AppConfig {
  language: Language;
  tableDisplayNames: Record<string, string>;
  supabaseConfig: {
    url: string;
    key: string;
    isConfigured: boolean;
  };
  setLanguage: (language: Language) => void;
  setTableDisplayName: (tableName: string, displayName: string) => void;
  setSupabaseConfig: (url: string, key: string) => void;
  isSupabaseConfigured: () => boolean;
  clearSupabaseConfig: () => void;
  getTableDisplayName: (tableName: string) => string;
}

export const useConfigStore = create<AppConfig>()(
  persist(
    (set, get) => ({
      language: 'en',
      tableDisplayNames: {},
      supabaseConfig: {
        url: '',
        key: '',
        isConfigured: false,
      },
      setLanguage: (language) => set({ language }),
      setTableDisplayName: (tableName, displayName) => 
        set((state) => ({
          tableDisplayNames: {
            ...state.tableDisplayNames,
            [tableName]: displayName,
          },
        })),
      setSupabaseConfig: (url, key) => 
        set({
          supabaseConfig: {
            url,
            key,
            isConfigured: true,
          },
        }),
      isSupabaseConfigured: () => get().supabaseConfig.isConfigured,
      clearSupabaseConfig: () => 
        set({
          supabaseConfig: {
            url: '',
            key: '',
            isConfigured: false,
          },
        }),
      getTableDisplayName: (tableName) => {
        return get().tableDisplayNames[tableName] || tableName;
      },
    }),
    {
      name: 'admin-db-config',
    }
  )
);
