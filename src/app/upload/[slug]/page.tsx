'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { FileDropzone } from '@/components/FileDropzone';
import { ColumnMapper } from '@/components/ColumnMapper';
import { localStore } from '@/lib/supabase';
import { parseCSV, validateData, transformData, downloadCSV } from '@/lib/csv';
import type { Template, ColumnMapping, ParsedCSV, ValidationError } from '@/types';

type Step = 'upload' | 'map' | 'validate' | 'complete';

export default function UploadPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('upload');
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [transformedData, setTransformedData] = useState<Record<string, string>[] | null>(null);

  useEffect(() => {
    const t = localStore.getTemplate(slug) as Template | undefined;
    setTemplate(t || null);
    setLoading(false);
  }, [slug]);

  const handleFileAccepted = async (file: File) => {
    try {
      const parsed = await parseCSV(file);
      setParsedData(parsed);
      setStep('map');
    } catch {
      alert('Failed to parse CSV file');
    }
  };

  const handleValidate = () => {
    if (!parsedData || !template) return;

    const validationErrors = validateData(parsedData.data, template.fields, mappings);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const transformed = transformData(parsedData.data, template.fields, mappings);
      setTransformedData(transformed);
      setStep('complete');
    } else {
      setStep('validate');
    }
  };

  const handleDownload = () => {
    if (!transformedData || !template) return;
    const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-standardized.csv`;
    downloadCSV(transformedData, filename);
  };

  const handleReset = () => {
    setStep('upload');
    setParsedData(null);
    setMappings([]);
    setErrors([]);
    setTransformedData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">Template not found</p>
        </div>
      </div>
    );
  }

  const requiredMapped = template.fields
    .filter((f) => f.required)
    .every((f) => mappings.some((m) => m.targetFieldId === f.id));

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <h1 className="text-lg font-medium text-white">{template.name}</h1>
          {template.description && (
            <p className="text-sm text-neutral-500 mt-1">{template.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <span className={step === 'upload' ? 'text-white' : ''}>Upload</span>
          <span>→</span>
          <span className={step === 'map' || step === 'validate' ? 'text-white' : ''}>Map</span>
          <span>→</span>
          <span className={step === 'complete' ? 'text-white' : ''}>Download</span>
        </div>

        {step === 'upload' && (
          <FileDropzone onFileAccepted={handleFileAccepted} />
        )}

        {step === 'map' && parsedData && (
          <div className="space-y-6">
            <p className="text-sm text-neutral-500">
              {parsedData.headers.length} columns, {parsedData.rowCount} rows
            </p>

            <ColumnMapper
              sourceColumns={parsedData.headers}
              targetFields={template.fields}
              mappings={mappings}
              onChange={setMappings}
            />

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleValidate}
                disabled={!requiredMapped}
                className="px-4 py-2 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'validate' && errors.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300">{errors.length} errors found</p>
                <p className="text-sm text-red-400/70 mt-1">Fix these in your CSV and try again</p>
              </div>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {errors.slice(0, 20).map((error, i) => (
                <div key={i} className="text-sm p-2 bg-neutral-900 rounded flex items-center gap-3">
                  <span className="text-neutral-600">Row {error.row}</span>
                  <span className="text-white">{error.field}</span>
                  <span className="text-red-400">{error.message}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep('map')}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-neutral-400 bg-neutral-800 rounded-lg hover:text-white"
              >
                Upload new file
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && transformedData && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white mb-1">Done</p>
            <p className="text-sm text-neutral-500 mb-6">{transformedData.length} rows standardized</p>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-neutral-800 rounded-lg hover:bg-neutral-700"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>

            <div className="mt-6">
              <button onClick={handleReset} className="text-sm text-neutral-500 hover:text-white">
                Upload another
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-600 mb-3">Expected fields</p>
          <div className="flex flex-wrap gap-2">
            {template.fields.map((field) => (
              <span
                key={field.id}
                className="text-xs px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-400"
              >
                {field.displayName}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
