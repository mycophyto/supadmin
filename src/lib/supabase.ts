import { toast } from '@/components/ui/use-toast';
import { useConfigStore } from '@/store/configStore';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
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
        supabaseClient = tempClient;
        // Skip database function setup for self-hosted instances
        return true;
      }
      
      return false;
    }
    
    // For Supabase.com hosted instances, we can actually test the connection
    // Test the connection by trying to access the auth config (this should always exist)
    const { error } = await tempClient.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    supabaseClient = tempClient;
    
    // Try to set up database functions
    try {
      await setupDatabaseFunctions();
    } catch (setupError) {
      console.warn('Could not set up database functions:', setupError);
      // Continue anyway as this is not critical
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
  const { supabaseConfig } = useConfigStore.getState();
  const isSelfHosted = supabaseConfig.url.includes('localhost') || supabaseConfig.url.includes('127.0.0.1');
  
  try {
    if (!isSelfHosted) {
      // Try RPC first for hosted instances
      const { data, error } = await supabase
        .rpc('get_tables', {
          schema_name: 'public'
        });

      if (!error && data) {
        return data.map((table: any) => ({
          name: table.table_name,
          description: table.description || '',
          recordCount: table.record_count || 0,
        }));
      }
    }

    // For self-hosted instances, use a direct query to information_schema
    const { data: tables, error: queryError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_type', 'VIEW')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', '_prisma_%')
      .not('table_name', 'like', 'information_%');

    if (queryError) {
      console.error('Error fetching tables:', queryError);
      
      // Try an alternative approach using the REST API directly
      const response = await fetch(`${supabaseConfig.url}/rest/v1/`, {
        headers: {
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`
        }
      });
      
      if (!response.ok) {
        console.error('Error fetching schema:', response.statusText);
        return [];
      }
      
      const schema = await response.json();
      const tableNames = Object.keys(schema.definitions || {})
        .filter(name => !name.startsWith('pg_') && 
                       !name.startsWith('_prisma_') && 
                       !name.startsWith('information_'));
      
      // Map the results
      const tableInfos = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });

            return {
              name: tableName,
              description: '',
              recordCount: count || 0,
            };
          } catch (countError) {
            console.error(`Error counting records for ${tableName}:`, countError);
            return {
              name: tableName,
              description: '',
              recordCount: 0,
            };
          }
        })
      );

      return tableInfos;
    }

    // Map the results from information_schema query
    const tableInfos = await Promise.all(
      (tables || []).map(async (table: { table_name: string }) => {
        try {
          const { count } = await supabase
            .from(table.table_name)
            .select('*', { count: 'exact', head: true });

          return {
            name: table.table_name,
            description: '',
            recordCount: count || 0,
          };
        } catch (countError) {
          console.error(`Error counting records for ${table.table_name}:`, countError);
          return {
            name: table.table_name,
            description: '',
            recordCount: 0,
          };
        }
      })
    );

    return tableInfos;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

// Get a table's schema (field definitions)
export async function getTableSchema(tableName: string): Promise<TableField[]> {
  const supabase = getSupabaseClient();
  
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
  const { supabaseConfig } = useConfigStore.getState();
  
  try {
    // Get all tables (excluding system tables)
    const tables = await getTables();
    
    // Calculate total records
    const totalRecords = tables.reduce((sum, table) => sum + table.recordCount, 0);
    
    // For self-hosted instances, we'll skip the DB size calculation
    const isSelfHosted = supabaseConfig.url.includes('localhost') || 
                        supabaseConfig.url.includes('127.0.0.1');
    
    return {
      totalTables: tables.length,
      totalRecords,
      storageUsed: isSelfHosted ? 'N/A' : '0 B',
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
      storageUsed: 'N/A',
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
  const { supabaseConfig } = useConfigStore.getState();
  const isSelfHosted = supabaseConfig.url.includes('localhost') || supabaseConfig.url.includes('127.0.0.1');
  
  // Skip function creation for self-hosted instances
  if (isSelfHosted) {
    console.log('Self-hosted instance detected, skipping database function setup');
    return true;
  }
  
  try {
    // Create the get_tables function
    const createGetTablesFunction = `
      CREATE OR REPLACE FUNCTION get_tables(schema_name text)
      RETURNS TABLE (
        table_name text,
        description text,
        record_count bigint
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          tables.tablename::text as table_name,
          obj_description(format('%I.%I', tables.schemaname, tables.tablename)::regclass, 'pg_class') as description,
          (SELECT reltuples::bigint FROM pg_class WHERE oid = format('%I.%I', tables.schemaname, tables.tablename)::regclass) as record_count
        FROM pg_catalog.pg_tables tables
        WHERE tables.schemaname = schema_name
        AND tables.tablename NOT LIKE 'pg_%'
        AND tables.tablename NOT LIKE '_prisma_%'
        AND tables.tablename NOT LIKE 'information_%';
      END;
      $$;
    `;

    const { error: functionError } = await supabase.rpc('create_function', {
      function_name: 'get_tables',
      function_body: createGetTablesFunction
    });

    if (functionError && !functionError.message.includes('already exists')) {
      console.error('Error creating get_tables function:', functionError);
    }
    
    return true;
  } catch (error) {
    console.error('Could not set up database functions:', error);
    // This is expected in many cases where the user doesn't have admin rights
    return true; // Return true anyway to allow the app to continue
  }
}

export async function createSettingsTable(): Promise<void> {
  const supabase = getSupabaseClient();
  const { supabaseConfig } = useConfigStore.getState();
  const isSelfHosted = supabaseConfig.url.includes('localhost') || supabaseConfig.url.includes('127.0.0.1');
  
  try {
    if (isSelfHosted) {
      // For self-hosted instances, check if table exists first
      const { data: existingTable } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);

      // If we can query the table, it exists
      if (existingTable !== null) {
        return;
      }

      // If we get here, we need to create the table
      // Try using the Supabase SQL editor endpoint
      const response = await fetch(`${supabaseConfig.url}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE IF NOT EXISTS app_settings (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              key text NOT NULL UNIQUE,
              value jsonb NOT NULL,
              created_at timestamptz NOT NULL DEFAULT now(),
              updated_at timestamptz NOT NULL DEFAULT now()
            );

            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = now();
              RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
            CREATE TRIGGER update_app_settings_updated_at
              BEFORE UPDATE ON app_settings
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
          `
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create settings table: ${response.statusText}`);
      }

      return;
    }
    
    // For hosted instances, use RPC
    const { error: tableError } = await supabase.rpc('create_table', {
      table_name: 'app_settings',
      columns: [
        { name: 'id', type: 'uuid', primary_key: true, default: 'uuid_generate_v4()' },
        { name: 'key', type: 'text', not_null: true, unique: true },
        { name: 'value', type: 'jsonb', not_null: true },
        { name: 'created_at', type: 'timestamptz', not_null: true, default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', not_null: true, default: 'now()' }
      ]
    });

    if (tableError) throw tableError;

    // Create the trigger function
    const { error: functionError } = await supabase.rpc('create_function', {
      function_name: 'update_updated_at_column',
      function_body: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (functionError && !functionError.message.includes('already exists')) {
      console.warn('Error creating trigger function:', functionError);
    }

    // Create the trigger
    const { error: triggerError } = await supabase.rpc('create_trigger', {
      trigger_name: 'update_app_settings_updated_at',
      table_name: 'app_settings',
      function_name: 'update_updated_at_column',
      trigger_type: 'BEFORE UPDATE'
    });

    if (triggerError && !triggerError.message.includes('already exists')) {
      console.warn('Error creating trigger:', triggerError);
    }
  } catch (error) {
    console.error('Error creating settings table:', error);
    throw error;
  }
}
