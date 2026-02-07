'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { TemplateField, FieldType } from '@/types';

interface TemplateBuilderProps {
  fields: TemplateField[];
  onChange: (fields: TemplateField[]) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'boolean', label: 'Yes/No' },
];

export function TemplateBuilder({ fields, onChange }: TemplateBuilderProps) {
  const addField = () => {
    const newField: TemplateField = {
      id: crypto.randomUUID(),
      name: '',
      displayName: '',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    onChange(
      fields.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates };
          if (updates.displayName && !f.name) {
            updated.name = updates.displayName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_|_$/g, '');
          }
          return updated;
        }
        return f;
      })
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-neutral-400">Fields</label>
        <button
          onClick={addField}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 bg-neutral-800 rounded-lg hover:text-white"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 text-neutral-600 text-sm border border-dashed border-neutral-800 rounded-lg">
          No fields yet
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className="group flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-4 gap-3">
                <input
                  type="text"
                  value={field.displayName}
                  onChange={(e) => updateField(field.id, { displayName: e.target.value })}
                  placeholder="Display name"
                  className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-600"
                />
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder="column_name"
                  className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-600 font-mono"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                  className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded text-white"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-white"
                  />
                  <span className="text-sm text-neutral-500">Required</span>
                </label>
              </div>
              <button
                onClick={() => removeField(field.id)}
                className="p-1.5 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
