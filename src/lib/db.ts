import { supabase } from './supabase';

const SETTINGS_TABLE = 'supadmin_settings';

export async function getSetting(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null;
      }
      throw error;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

export async function setSetting(key: string, value: any): Promise<void> {
  try {
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        key,
        value
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
}

export async function deleteSetting(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .delete()
      .eq('key', key);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
}

export async function getAllSettings(): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('key, value');

    if (error) throw error;

    return data.reduce((acc: Record<string, any>, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
} 