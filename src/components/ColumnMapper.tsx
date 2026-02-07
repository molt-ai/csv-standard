'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { TemplateField, ColumnMapping } from '@/types';

interface ColumnMapperProps {
  sourceColumns: string[];
  targetFields: TemplateField[];
  mappings: ColumnMapping[];
  onChange: (mappings: ColumnMapping[]) => void;
}

function fuzzyMatch(source: string, target: string): number {
  const s = source.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s === t) return 1;
  if (s.includes(t) || t.includes(s)) return 0.8;
  
  const variations: Record<string, string[]> = {
    'name': ['nombre', 'nom', 'customer', 'client'],
    'email': ['correo', 'mail', 'e-mail'],
    'phone': ['telefono', 'tel', 'mobile', 'cell'],
    'date': ['fecha', 'dt', 'time'],
    'amount': ['cantidad', 'total', 'price', 'cost', 'value'],
    'id': ['identifier', 'code', 'number', 'num', 'no'],
  };
  
  for (const [key, aliases] of Object.entries(variations)) {
    if ((s.includes(key) || aliases.some(a => s.includes(a))) &&
        (t.includes(key) || aliases.some(a => t.includes(a)))) {
      return 0.6;
    }
  }
  
  return 0;
}

export function ColumnMapper({
  sourceColumns,
  targetFields,
  mappings,
  onChange,
}: ColumnMapperProps) {
  const [autoMapped, setAutoMapped] = useState(false);

  useEffect(() => {
    if (mappings.length === 0 && sourceColumns.length > 0 && !autoMapped) {
      const autoMappings: ColumnMapping[] = [];
      
      targetFields.forEach((field) => {
        let bestMatch = { column: '', score: 0 };
        
        sourceColumns.forEach((col) => {
          const score = Math.max(
            fuzzyMatch(col, field.name),
            fuzzyMatch(col, field.displayName)
          );
          if (score > bestMatch.score && !autoMappings.some(m => m.sourceColumn === col)) {
            bestMatch = { column: col, score };
          }
        });
        
        if (bestMatch.score >= 0.5) {
          autoMappings.push({
            sourceColumn: bestMatch.column,
            targetFieldId: field.id,
          });
        }
      });
      
      if (autoMappings.length > 0) {
        onChange(autoMappings);
        setAutoMapped(true);
      }
    }
  }, [sourceColumns, targetFields, mappings.length, onChange, autoMapped]);

  const getMapping = (fieldId: string) => {
    return mappings.find((m) => m.targetFieldId === fieldId)?.sourceColumn || '';
  };

  const updateMapping = (fieldId: string, sourceColumn: string) => {
    const existing = mappings.filter((m) => m.targetFieldId !== fieldId);
    if (sourceColumn) {
      existing.push({ sourceColumn, targetFieldId: fieldId });
    }
    onChange(existing);
  };

  return (
    <div className="space-y-2">
      {targetFields.map((field) => {
        const mappedColumn = getMapping(field.id);
        const isMapped = !!mappedColumn;

        return (
          <div
            key={field.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isMapped
                ? 'bg-neutral-900 border-neutral-700'
                : field.required
                ? 'bg-neutral-900 border-red-900/50'
                : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            <select
              value={mappedColumn}
              onChange={(e) => updateMapping(field.id, e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded text-white"
            >
              <option value="">Select column</option>
              {sourceColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            <ArrowRight className="w-4 h-4 text-neutral-600 flex-shrink-0" />

            <div className="flex-1 flex items-center justify-between">
              <div>
                <span className="text-white text-sm">{field.displayName}</span>
                {field.required && <span className="text-red-400 ml-1">*</span>}
                <span className="text-neutral-600 text-xs ml-2">{field.type}</span>
              </div>
              {isMapped && <Check className="w-4 h-4 text-green-500" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
