import { toast } from '@/components/ui/use-toast';
import { useConfigStore } from '@/store/configStore';
import { Database, TableField, TableInfo } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

// OpenAPI spec types
interface OpenAPISchema {
  description?: string;
  properties?: Record<string, OpenAPIProperty>;
  required?: string[];
}

interface OpenAPIProperty {
  type: string;
  description?: string;
  default?: any;
}

interface OpenAPISpec {
  components: {
    schemas: Record<string, OpenAPISchema>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// For operations that require service role access
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseKey
);

export async function getTables(): Promise<TableInfo[]> {
  try {
    // Get the OpenAPI spec from the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API spec: ${response.statusText}`);
    }

    const spec = await response.json();
    
    // Extract tables from the OpenAPI spec
    const tables = Object.entries(spec.paths || {})
      .filter(([path]) => path.startsWith('/'))
      .map(([path, pathSpec]: [string, any]) => {
        const tableName = path.replace('/', '');
        const schema = pathSpec.get?.responses?.['200']?.schema?.items || 
                      pathSpec.post?.responses?.['201']?.schema;
        
        if (!schema) {
          return null;
        }

        return {
          name: tableName,
          displayName: tableName,
          description: pathSpec.get?.description || pathSpec.post?.description || '',
          columns: Object.entries(schema.properties || {}).map(([colName, colSchema]: [string, any]) => ({
            name: colName,
            type: colSchema.type,
            isNullable: !schema.required?.includes(colName),
            defaultValue: colSchema.default,
            description: colSchema.description || '',
            required: schema.required?.includes(colName) || false,
            isPrimaryKey: colName === 'id'
          })),
          recordCount: 0 // We'll get this separately
        };
      })
      .filter((table): table is TableInfo => table !== null);

    // Get record counts for each table
    const tablesWithCounts = await Promise.all(
      tables.map(async (table) => {
        try {
          const { count, error: countError } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });

          if (countError) {
            console.error(`Error getting count for table ${table.name}:`, countError);
            return {
              ...table,
              recordCount: 0
            };
          }

          return {
            ...table,
            recordCount: count || 0
          };
        } catch (error) {
          console.error(`Error getting count for table ${table.name}:`, error);
          return {
            ...table,
            recordCount: 0
          };
        }
      })
    );

    return tablesWithCounts;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export async function getTableSchema(tableName: string): Promise<TableField[]> {
  try {
    // Get the OpenAPI spec
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API spec: ${response.statusText}`);
    }

    const spec = await response.json();
    const pathSpec = spec.paths?.[`/${tableName}`];
    
    if (!pathSpec) {
      throw new Error(`Table ${tableName} not found in API spec`);
    }

    const schema = pathSpec.get?.responses?.['200']?.schema?.items || 
                  pathSpec.post?.responses?.['201']?.schema;

    if (!schema) {
      throw new Error(`No schema found for table ${tableName}`);
    }

    return Object.entries(schema.properties || {}).map(([colName, colSchema]: [string, any]) => ({
      name: colName,
      type: colSchema.type,
      isNullable: !schema.required?.includes(colName),
      defaultValue: colSchema.default,
      description: colSchema.description || '',
      required: schema.required?.includes(colName) || false,
      isPrimaryKey: colName === 'id'
    }));
  } catch (error) {
    console.error('Error fetching table schema:', error);
    throw error;
  }
}

export async function getTableData(
  tableName: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('id', { ascending: true });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error fetching table data:', error);
    throw error;
  }
}

export async function createRecord(tableName: string, record: any) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
}

export async function updateRecord(tableName: string, id: string, record: any) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
}

export async function deleteRecord(tableName: string, id: string) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

// Get statistics about database usage
export async function getDatabaseStats() {
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

// Function to get the SQL for creating the necessary database functions
export function getSetupDatabaseSQL(): string {
  return `
-- Function to get all tables
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (
  table_name text,
  table_description text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    obj_description((quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass, 'pg_class')::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE 'supabase_%'
  ORDER BY t.table_name;
END;
$$;

-- Function to get columns for a specific table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text,
  column_description text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text,
    col_description((quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass, c.ordinal_position)::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  AND c.table_name = table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- Create the settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS supadmin_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL
);`;
}

// Function to get the SQL script for getting tables
export function getTablesSQL(): string {
  return `
SELECT
  tables.tablename::text as table_name,
  obj_description(format('%I.%I', tables.schemaname, tables.tablename)::regclass, 'pg_class') as description,
  (SELECT reltuples::bigint FROM pg_class WHERE oid = format('%I.%I', tables.schemaname, tables.tablename)::regclass) as record_count
FROM pg_catalog.pg_tables tables
WHERE tables.schemaname = 'public'
AND tables.tablename NOT LIKE 'pg_%'
AND tables.tablename NOT LIKE '_prisma_%'
AND tables.tablename NOT LIKE 'information_%';
`;
}

// Function to get the SQL script for getting table schema
export function getTableSchemaSQL(tableName: string): string {
  return `
SELECT 
  column_name as name,
  data_type as type,
  is_nullable = 'NO' as required,
  column_name = 'id' OR column_name = 'uuid' as is_primary_key
FROM information_schema.columns
WHERE table_name = '${tableName}'
ORDER BY ordinal_position;
`;
}

export async function createSettingsTable(): Promise<void> {
  try {
    // Try to insert a test record to check if the table exists
    const { error } = await supabase
      .from('supadmin_settings')
      .insert({
        key: 'test',
        value: { test: true }
      });

    // If we get a table not found error, that's expected
    if (error && error.code !== '42P01') {
      throw error;
    }
  } catch (error) {
    console.error('Error checking settings table:', error);
    throw error;
  }
}

// Function to get the SQL script for creating the settings table
export function getCreateSettingsTableSQL(): string {
  return `-- Create the settings table
CREATE TABLE IF NOT EXISTS supadmin_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL
);`;
}
