'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { TemplateBuilder } from '@/components/TemplateBuilder';
import { localStore } from '@/lib/supabase';
import type { Template, TemplateField } from '@/types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 8);
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    const incompleteFields = fields.filter((f) => !f.name || !f.displayName);
    if (incompleteFields.length > 0) {
      alert('Please fill in all field names');
      return;
    }

    setSaving(true);

    const template: Template = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      fields,
      slug: generateSlug(name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'local',
    };

    localStore.saveTemplate(template);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/"
            className="p-1.5 text-neutral-500 hover:text-white rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-medium text-white">New Template</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales Orders"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Description <span className="text-neutral-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template for?"
              rows={2}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-neutral-600 resize-none"
            />
          </div>
        </div>

        <div className="pt-4">
          <TemplateBuilder fields={fields} onChange={setFields} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-neutral-500 hover:text-white"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </main>
    </div>
  );
}
