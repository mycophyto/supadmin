export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, Json>
        Insert: Record<string, Json>
        Update: Record<string, Json>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, Json>
        Insert: Record<string, Json>
        Update: Record<string, Json>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, Json>
        Returns: Json
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
}

export interface TableField {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: any;
  description: string;
  required: boolean;
  isPrimaryKey: boolean;
}

export interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  columns: TableField[];
  recordCount: number;
} 