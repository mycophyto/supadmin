import { createSettingsTable, getSupabaseClient, initializeSupabase } from '@/lib/supabase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'fr';
export type StorageType = 'local' | 'supabase';

export interface AppConfig {
  language: Language;
  tableDisplayNames: Record<string, string>;
  hiddenTables: string[];
  storageType: StorageType;
  supabaseConfig: {
    url: string;
    key: string;
    isConfigured: boolean;
  };
  setLanguage: (language: Language) => void;
  setTableDisplayName: (tableName: string, displayName: string) => void;
  setHiddenTable: (tableName: string, hidden: boolean) => void;
  setSupabaseConfig: (url: string, key: string) => Promise<void>;
  setStorageType: (type: StorageType) => void;
  isSupabaseConfigured: () => boolean;
  clearSupabaseConfig: () => void;
  getTableDisplayName: (tableName: string) => string;
  syncWithSupabase: () => Promise<void>;
}

export const useConfigStore = create<AppConfig>()(
  persist(
    (set, get) => ({
      language: 'en',
      tableDisplayNames: {},
      hiddenTables: [],
      storageType: 'local',
      supabaseConfig: {
        url: '',
        key: '',
        isConfigured: false,
      },
      setLanguage: async (language) => {
        set({ language });
        if (get().storageType === 'supabase') {
          await get().syncWithSupabase();
        }
      },
      setTableDisplayName: async (tableName, displayName) => {
        set((state) => ({
          tableDisplayNames: {
            ...state.tableDisplayNames,
            [tableName]: displayName,
          },
        }));
        if (get().storageType === 'supabase') {
          await get().syncWithSupabase();
        }
      },
      setHiddenTable: async (tableName, hidden) => {
        set((state) => ({
          hiddenTables: hidden
            ? [...state.hiddenTables, tableName]
            : state.hiddenTables.filter(name => name !== tableName),
        }));
        if (get().storageType === 'supabase') {
          await get().syncWithSupabase();
        }
      },
      setStorageType: async (type) => {
        if (type === 'supabase') {
          try {
            await createSettingsTable();
            await get().syncWithSupabase();
          } catch (error) {
            console.error('Failed to setup Supabase storage:', error);
            return;
          }
        }
        set({ storageType: type });
      },
      setSupabaseConfig: async (url, key) => {
        const success = await initializeSupabase(url, key);
        if (success) {
          set({
            supabaseConfig: {
              url,
              key,
              isConfigured: true,
            },
          });
        } else {
          throw new Error('Failed to initialize Supabase client');
        }
      },
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
      syncWithSupabase: async () => {
        const state = get();
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: 'app_config',
            value: {
              language: state.language,
              tableDisplayNames: state.tableDisplayNames,
              hiddenTables: state.hiddenTables,
            }
          });
        
        if (error) {
          console.error('Failed to sync with Supabase:', error);
        }
      },
    }),
    {
      name: 'admin-db-config',
      partialize: (state) => ({
        language: state.language,
        tableDisplayNames: state.tableDisplayNames,
        hiddenTables: state.hiddenTables,
        storageType: state.storageType,
        supabaseConfig: state.supabaseConfig,
      }),
    }
  )
);
