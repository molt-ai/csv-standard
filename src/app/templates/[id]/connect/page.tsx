'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Check, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { localStore } from '@/lib/supabase';
import type { Template, SheetConnection } from '@/types';

interface Spreadsheet {
  id: string;
  name: string;
}

export default function ConnectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<Spreadsheet | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('Sheet1');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = localStore.getTemplate(templateId) as Template | undefined;
    setTemplate(t || null);
    
    const at = searchParams.get('access_token');
    const rt = searchParams.get('refresh_token');
    if (at) setAccessToken(at);
    if (rt) setRefreshToken(rt);
  }, [templateId, searchParams]);

  useEffect(() => {
    if (accessToken) {
      fetchSpreadsheets();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedSpreadsheet && accessToken) {
      fetchSheets(selectedSpreadsheet.id);
    }
  }, [selectedSpreadsheet, accessToken]);

  const fetchSpreadsheets = async () => {
    try {
      const res = await fetch('/api/google/sheets', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setSpreadsheets(data.spreadsheets || []);
    } catch (error) {
      console.error('Failed to fetch spreadsheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheets = async (spreadsheetId: string) => {
    try {
      const res = await fetch(`/api/google/sheets?spreadsheetId=${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setSheets(data.sheets || ['Sheet1']);
      setSelectedSheet(data.sheets?.[0] || 'Sheet1');
    } catch (error) {
      console.error('Failed to fetch sheets:', error);
    }
  };

  const createNewSpreadsheet = async () => {
    if (!template) return;
    setCreating(true);
    try {
      const res = await fetch('/api/google/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title: `${template.name} Data` }),
      });
      const data = await res.json();
      const newSpreadsheet = { id: data.id, name: data.name };
      setSpreadsheets([newSpreadsheet, ...spreadsheets]);
      setSelectedSpreadsheet(newSpreadsheet);
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
    } finally {
      setCreating(false);
    }
  };

  const saveConnection = () => {
    if (!template || !selectedSpreadsheet) return;
    setSaving(true);

    const connection: SheetConnection = {
      provider: 'google_sheets',
      accessToken,
      refreshToken,
      spreadsheetId: selectedSpreadsheet.id,
      spreadsheetName: selectedSpreadsheet.name,
      sheetName: selectedSheet,
      connectedAt: new Date().toISOString(),
    };

    const updatedTemplate = {
      ...template,
      destination: connection,
      updatedAt: new Date().toISOString(),
    };

    localStore.saveTemplate(updatedTemplate);
    router.push('/');
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="text-neutral-500">Template not found</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Connect to Google Sheets</p>
          <a
            href={`/api/google/auth?templateId=${templateId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Sign in with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="border-b border-neutral-800">
        <div className="max-w-xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/" className="p-1.5 text-neutral-500 hover:text-white rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-white">Connect Destination</h1>
            <p className="text-sm text-neutral-500">{template.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-sm text-neutral-400">Select spreadsheet</label>
          <button
            onClick={createNewSpreadsheet}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 bg-neutral-800 rounded-lg hover:text-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creating...' : 'Create new'}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-500">Loading spreadsheets...</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {spreadsheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedSpreadsheet(sheet)}
                className={`w-full text-left p-3 rounded-lg border flex items-center justify-between ${
                  selectedSpreadsheet?.id === sheet.id
                    ? 'bg-neutral-800 border-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="text-white text-sm">{sheet.name}</span>
                {selectedSpreadsheet?.id === sheet.id && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
            {spreadsheets.length === 0 && (
              <p className="text-neutral-500 text-sm py-8 text-center">
                No spreadsheets found. Create one above.
              </p>
            )}
          </div>
        )}

        {selectedSpreadsheet && sheets.length > 1 && (
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Select sheet</label>
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white"
            >
              {sheets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            onClick={saveConnection}
            disabled={!selectedSpreadsheet || saving}
            className="px-4 py-2 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Connection'}
          </button>
        </div>
      </main>
    </div>
  );
}
