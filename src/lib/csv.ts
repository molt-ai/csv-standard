import Papa from 'papaparse';
import type { ParsedCSV, TemplateField, ColumnMapping, ValidationError, FieldType } from '@/types';

export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          data: results.data as Record<string, string>[],
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function validateValue(value: string, type: FieldType): boolean {
  if (!value || value.trim() === '') return true; // Empty is valid (required check is separate)
  
  switch (type) {
    case 'number':
      return !isNaN(Number(value));
    case 'date':
      return !isNaN(Date.parse(value));
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'boolean':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
    case 'text':
    default:
      return true;
  }
}

export function validateData(
  data: Record<string, string>[],
  fields: TemplateField[],
  mappings: ColumnMapping[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Create a map of targetFieldId -> sourceColumn
  const mappingMap = new Map(mappings.map(m => [m.targetFieldId, m.sourceColumn]));
  
  data.forEach((row, rowIndex) => {
    fields.forEach((field) => {
      const sourceColumn = mappingMap.get(field.id);
      if (!sourceColumn) return;
      
      const value = row[sourceColumn] || '';
      
      // Required check
      if (field.required && (!value || value.trim() === '')) {
        errors.push({
          row: rowIndex + 1,
          field: field.displayName,
          message: `${field.displayName} is required`,
          value: '',
        });
        return;
      }
      
      // Type check
      if (value && !validateValue(value, field.type)) {
        errors.push({
          row: rowIndex + 1,
          field: field.displayName,
          message: `Invalid ${field.type} format`,
          value,
        });
      }
    });
  });
  
  return errors;
}

export function transformData(
  data: Record<string, string>[],
  fields: TemplateField[],
  mappings: ColumnMapping[]
): Record<string, string>[] {
  const mappingMap = new Map(mappings.map(m => [m.targetFieldId, m.sourceColumn]));
  
  return data.map((row) => {
    const newRow: Record<string, string> = {};
    
    fields.forEach((field) => {
      const sourceColumn = mappingMap.get(field.id);
      if (sourceColumn) {
        newRow[field.name] = row[sourceColumn] || '';
      } else {
        newRow[field.name] = '';
      }
    });
    
    return newRow;
  });
}

export function generateCSV(data: Record<string, string>[]): string {
  return Papa.unparse(data);
}

export function downloadCSV(data: Record<string, string>[], filename: string) {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
