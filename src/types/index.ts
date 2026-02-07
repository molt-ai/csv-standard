export type FieldType = 'text' | 'number' | 'date' | 'email' | 'boolean';

export interface TemplateField {
  id: string;
  name: string;
  displayName: string;
  type: FieldType;
  required: boolean;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  slug: string; // for the shareable URL
}

export interface ColumnMapping {
  sourceColumn: string;
  targetFieldId: string;
}

export interface UploadRecord {
  id: string;
  templateId: string;
  fileName: string;
  rowCount: number;
  errorCount: number;
  createdAt: string;
  mappings: ColumnMapping[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface ParsedCSV {
  headers: string[];
  data: Record<string, string>[];
  rowCount: number;
}
