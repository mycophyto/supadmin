import { createSettingsTable, supabase } from '@/lib/supabase';
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
    serviceKey?: string;
    isConfigured: boolean;
  };
  setLanguage: (language: Language) => void;
  setTableDisplayName: (tableName: string, displayName: string) => void;
  setHiddenTable: (tableName: string, hidden: boolean) => void;
  setSupabaseConfig: (url: string, key: string, serviceKey?: string) => Promise<boolean>;
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
        serviceKey: '',
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
            // Create the settings table
            await createSettingsTable();
            
            // Finally sync with Supabase
            await get().syncWithSupabase();
          } catch (error) {
            console.error('Failed to setup Supabase storage:', error);
            return;
          }
        }
        set({ storageType: type });
      },
      setSupabaseConfig: async (url, key, serviceKey) => {
        try {
          // Test the connection by making a simple query
          const { error } = await supabase.from('supadmin_settings').select('count');
          if (error) throw error;
          
          set({
            supabaseConfig: {
              url,
              key,
              serviceKey,
              isConfigured: true,
            },
          });
          return true;
        } catch (error) {
          console.error('Failed to initialize Supabase:', error);
          return false;
        }
      },
      isSupabaseConfigured: () => get().supabaseConfig.isConfigured,
      clearSupabaseConfig: () => 
        set({
          supabaseConfig: {
            url: '',
            key: '',
            serviceKey: '',
            isConfigured: false,
          },
        }),
      getTableDisplayName: (tableName) => {
        return get().tableDisplayNames[tableName] || tableName;
      },
      syncWithSupabase: async () => {
        const state = get();
        
        try {
          // First try to update the existing record
          const { error: updateError } = await supabase
            .from('supadmin_settings')
            .update({
              value: {
                language: state.language,
                tableDisplayNames: state.tableDisplayNames,
                hiddenTables: state.hiddenTables,
              }
            })
            .eq('key', 'app_config');

          // If no record exists (updateError.code === 'PGRST116'), insert a new one
          if (updateError?.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('supadmin_settings')
              .insert({
                key: 'app_config',
                value: {
                  language: state.language,
                  tableDisplayNames: state.tableDisplayNames,
                  hiddenTables: state.hiddenTables,
                }
              });

            if (insertError) {
              console.error('Failed to insert settings:', insertError);
              throw insertError;
            }
          } else if (updateError) {
            console.error('Failed to update settings:', updateError);
            throw updateError;
          }
        } catch (error) {
          console.error('Failed to sync with Supabase:', error);
          throw error;
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
