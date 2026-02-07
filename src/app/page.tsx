'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Trash2, Copy, Check } from 'lucide-react';
import { localStore } from '@/lib/supabase';
import type { Template } from '@/types';

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(localStore.getTemplates() as Template[]);
  }, []);

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      localStore.deleteTemplate(id);
      setTemplates(localStore.getTemplates() as Template[]);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/upload/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-lg font-medium text-white">CSV Standard</h1>
          <Link
            href="/templates/new"
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {templates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 mb-6">No templates yet</p>
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700"
            >
              <Plus className="w-4 h-4" />
              Create your first template
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group p-5 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-white">{template.name}</h2>
                    {template.description && (
                      <p className="text-neutral-500 text-sm mt-1">{template.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                      <span>{template.fields.length} fields</span>
                      <span>•</span>
                      <span>{template.fields.filter((f) => f.required).length} required</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyLink(template.slug)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 bg-neutral-800 rounded hover:text-white"
                    >
                      {copiedId === template.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <Link
                      href={`/upload/${template.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 bg-neutral-800 rounded hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </Link>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1.5 text-neutral-600 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800">
                  <code className="text-xs text-neutral-600">
                    {typeof window !== 'undefined'
                      ? `${window.location.origin}/upload/${template.slug}`
                      : `/upload/${template.slug}`}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
