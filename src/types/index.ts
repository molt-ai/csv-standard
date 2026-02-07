export type FieldType = 'text' | 'number' | 'date' | 'email' | 'boolean';

export interface TemplateField {
  id: string;
  name: string;
  displayName: string;
  type: FieldType;
  required: boolean;
  description?: string;
}

export interface SheetConnection {
  provider: 'google_sheets';
  accessToken: string;
  refreshToken: string;
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
  connectedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  slug: string;
  destination?: SheetConnection;
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
