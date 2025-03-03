import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { useConfigStore } from '@/store/configStore';

// Dynamic Supabase client that uses the config from the store
export function getSupabaseClient() {
  const { supabaseConfig } = useConfigStore.getState();
  
  if (!supabaseConfig.isConfigured) {
    console.error('Supabase is not configured');
    return null;
  }
  
  return createClient(supabaseConfig.url, supabaseConfig.key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'X-Client-Info': 'AdminDB'
      }
    }
  });
}

// Initialize and test the Supabase connection
export async function initializeSupabase(url: string, key: string) {
  try {
    // Create a temporary client with custom fetch options to handle CORS
    const tempClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'AdminDB'
        }
      }
    });
    
    // For self-hosted instances, we may need special handling
    const isSelfHosted = url.includes('localhost') || url.includes('127.0.0.1');
    
    if (isSelfHosted) {
      // For self-hosted instances, we just check that the URL and key are valid
      // and assume the connection is fine if they appear to be in the right format
      const validUrl = url.startsWith('http://') || url.startsWith('https://');
      const validKey = key.length > 10; // Basic check that key has reasonable length
      
      if (validUrl && validKey) {
        console.log('Self-hosted Supabase instance detected. Skipping connection test.');
        return true;
      }
      
      return false;
    }
    
    // For Supabase.com hosted instances, we can actually test the connection
    // Test the connection by querying the database version
    const { error } = await tempClient.from('_database_version').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which is fine, it means we're connected
      // but the table doesn't exist, which is expected
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    return false;
  }
}

export interface TableInfo {
  name: string;
  description?: string;
  recordCount: number;
}

export interface TableField {
  name: string;
  type: string;
  required: boolean;
  isPrimaryKey: boolean;
}

// Get all tables in the database
export async function getTables(): Promise<TableInfo[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // Return mock data if not configured
    return getMockTables();
  }
  
  try {
    // In a real implementation with an actual Supabase connection:
    // 1. Query the information_schema.tables view to get table info
    // 2. Query to get record counts
    // For now we'll continue with mock data
    return getMockTables();
  } catch (error) {
    console.error('Error fetching tables:', error);
    toast({
      title: 'Error fetching tables',
      description: 'Unable to load table information.',
      variant: 'destructive',
    });
    return [];
  }
}

function getMockTables(): TableInfo[] {
  return [
    { name: 'users', description: 'User accounts', recordCount: 1250 },
    { name: 'products', description: 'Product catalog', recordCount: 432 },
    { name: 'orders', description: 'Customer orders', recordCount: 6789 },
    { name: 'categories', description: 'Product categories', recordCount: 24 },
    { name: 'reviews', description: 'Product reviews', recordCount: 1876 }
  ];
}

// Get a table's schema (field definitions)
export async function getTableSchema(tableName: string): Promise<TableField[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // Return mock data if not configured
    return getMockSchema(tableName);
  }
  
  try {
    // In a real implementation with an actual Supabase connection:
    // Query information_schema.columns to get column information
    return getMockSchema(tableName);
  } catch (error) {
    console.error(`Error fetching schema for ${tableName}:`, error);
    toast({
      title: 'Error fetching schema',
      description: `Unable to load schema for table ${tableName}.`,
      variant: 'destructive',
    });
    return [];
  }
}

function getMockSchema(tableName: string): TableField[] {
  const mockSchemas: Record<string, TableField[]> = {
    users: [
      { name: 'id', type: 'uuid', required: true, isPrimaryKey: true },
      { name: 'name', type: 'text', required: true, isPrimaryKey: false },
      { name: 'email', type: 'text', required: true, isPrimaryKey: false },
      { name: 'created_at', type: 'timestamp', required: true, isPrimaryKey: false }
    ],
    products: [
      { name: 'id', type: 'uuid', required: true, isPrimaryKey: true },
      { name: 'name', type: 'text', required: true, isPrimaryKey: false },
      { name: 'price', type: 'numeric', required: true, isPrimaryKey: false },
      { name: 'description', type: 'text', required: false, isPrimaryKey: false },
      { name: 'category_id', type: 'uuid', required: true, isPrimaryKey: false }
    ],
  };
  
  return mockSchemas[tableName] || [];
}

// Get data from a table
export async function getTableData(tableName: string, page = 1, pageSize = 10) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // Return mock data if not configured
    return { data: [], count: 0 };
  }
  
  try {
    // With a real Supabase connection, this would be:
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    if (error) throw error;
    
    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    toast({
      title: 'Error fetching data',
      description: `Unable to load data from table ${tableName}.`,
      variant: 'destructive',
    });
    return { data: [], count: 0 };
  }
}

// Update a record in a table
export async function updateRecord(tableName: string, id: string, data: any) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    toast({
      title: 'Supabase not configured',
      description: 'Please configure your Supabase connection in settings.',
      variant: 'destructive',
    });
    return false;
  }
  
  try {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: 'Record updated',
      description: 'The record has been successfully updated.',
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating record in ${tableName}:`, error);
    toast({
      title: 'Error updating record',
      description: 'Unable to update the record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
}

// Create a new record in a table
export async function createRecord(tableName: string, data: any) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    toast({
      title: 'Supabase not configured',
      description: 'Please configure your Supabase connection in settings.',
      variant: 'destructive',
    });
    return false;
  }
  
  try {
    const { error } = await supabase
      .from(tableName)
      .insert([data]);
    
    if (error) throw error;
    
    toast({
      title: 'Record created',
      description: 'The record has been successfully created.',
    });
    
    return true;
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    toast({
      title: 'Error creating record',
      description: 'Unable to create the record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
}

// Delete a record from a table
export async function deleteRecord(tableName: string, id: string) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    toast({
      title: 'Supabase not configured',
      description: 'Please configure your Supabase connection in settings.',
      variant: 'destructive',
    });
    return false;
  }
  
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: 'Record deleted',
      description: 'The record has been successfully deleted.',
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting record from ${tableName}:`, error);
    toast({
      title: 'Error deleting record',
      description: 'Unable to delete the record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
}

// Get statistics about database usage
export async function getDatabaseStats() {
  // This would typically come from Supabase's API or a custom endpoint
  // For now, we'll return mock data
  return {
    totalTables: 12,
    totalRecords: 45231,
    storageUsed: '1.2 GB',
    lastUpdated: new Date().toISOString()
  };
}
