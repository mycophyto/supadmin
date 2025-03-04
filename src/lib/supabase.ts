import { toast } from '@/components/ui/use-toast';
import { useConfigStore } from '@/store/configStore';
import { createClient } from '@supabase/supabase-js';

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

interface OpenAPIDefinition {
  properties?: Record<string, any>;
  description?: string;
}

// Get all tables in the database
export async function getTables(): Promise<TableInfo[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return [];
  }
  
  try {
    // Get the OpenAPI spec from Supabase
    const { supabaseConfig } = useConfigStore.getState();
    const response = await fetch(`${supabaseConfig.url}/rest/v1/`, {
      headers: {
        'apikey': supabaseConfig.key,
        'Authorization': `Bearer ${supabaseConfig.key}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
    }
    
    const openApiSpec = await response.json();
    
    // Get all table definitions from the OpenAPI spec
    const tableInfo: TableInfo[] = [];
    
    for (const [tableName, tableDef] of Object.entries(openApiSpec.definitions || {}) as [string, OpenAPIDefinition][]) {
      // Skip system tables and non-table definitions
      if (tableName.startsWith('_') || tableName.startsWith('auth_') || !tableDef.properties) {
        continue;
      }
      
      try {
        // Get count of records in the table
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          tableInfo.push({
            name: tableName,
            description: tableDef.description || undefined,
            recordCount: count || 0
          });
        }
      } catch (e) {
        console.error(`Error counting records for table ${tableName}:`, e);
        // Still add the table, just with 0 records
        tableInfo.push({
          name: tableName,
          description: tableDef.description || undefined,
          recordCount: 0
        });
      }
    }
    
    return tableInfo;
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

// Get a table's schema (field definitions)
export async function getTableSchema(tableName: string): Promise<TableField[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return [];
  }
  
  try {
    // Get the OpenAPI spec from Supabase
    const { supabaseConfig } = useConfigStore.getState();
    const response = await fetch(`${supabaseConfig.url}/rest/v1/`, {
      headers: {
        'apikey': supabaseConfig.key,
        'Authorization': `Bearer ${supabaseConfig.key}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
    }
    
    const openApiSpec = await response.json();
    
    // Find the table definition in the OpenAPI spec
    const tableDef = openApiSpec.definitions?.[tableName];
    if (!tableDef) {
      console.error(`Table ${tableName} not found in schema`);
      return [];
    }
    
    // Transform the OpenAPI schema into our TableField format
    return Object.entries(tableDef.properties || {}).map(([key, value]: [string, any]) => {
      // Handle array types
      const type = value.type === 'array' ? 
        `${value.items?.type || 'any'}[]` : 
        value.type;
      
      // Handle JSON types
      const finalType = type === 'object' ? 'jsonb' : type;
      
      return {
        name: key,
        type: finalType,
        required: (tableDef.required || []).includes(key),
        isPrimaryKey: key === 'id' || value.description?.includes('Primary Key'),
      };
    });
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

// Get data from a table
export async function getTableData(tableName: string, page = 1, pageSize = 10) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return { data: [], count: 0 };
  }
  
  try {
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
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase client not available');
    return {
      totalTables: 0,
      totalRecords: 0,
      storageUsed: '0 B',
      lastUpdated: new Date().toISOString()
    };
  }
  
  try {
    // Get all tables (excluding system tables)
    const tables = await getTables();
    
    // Calculate total records
    const totalRecords = tables.reduce((sum, table) => sum + table.recordCount, 0);
    
    // Get DB size (this requires a stored procedure or extension in Supabase)
    let storageUsed = '0 B';
    
    try {
      // Try to get DB size using pg_database_size function
      const { data: sizeData, error: sizeError } = await supabase.rpc('get_db_size');
      
      if (!sizeError && sizeData) {
        // Convert bytes to human-readable format
        storageUsed = formatBytes(sizeData);
      }
    } catch (sizeError) {
      console.error('Error getting database size:', sizeError);
    }
    
    return {
      totalTables: tables.length,
      totalRecords,
      storageUsed,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    toast({
      title: 'Error fetching database stats',
      description: 'Could not fetch database statistics.',
      variant: 'destructive',
    });
    
    return {
      totalTables: 0,
      totalRecords: 0,
      storageUsed: '0 B',
      lastUpdated: new Date().toISOString()
    };
  }
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Function to create necessary database functions if they don't exist
export async function setupDatabaseFunctions() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return false;
  }
  
  try {
    // Check if we can create SQL functions (requires admin rights)
    const { error: functionCheckError } = await supabase.rpc('get_db_size', {});
    
    // If the function doesn't exist, try to create it
    if (functionCheckError && functionCheckError.message.includes('does not exist')) {
      // Try to create the function to get DB size
      await supabase.rpc('create_db_size_function');
      
      // Try to create the function to get table columns
      await supabase.rpc('create_table_columns_function');
    }
    
    return true;
  } catch (error) {
    console.error('Could not set up database functions:', error);
    // This is expected in many cases where the user doesn't have admin rights
    return false;
  }
}
