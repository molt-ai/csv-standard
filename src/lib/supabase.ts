import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For now, we'll use localStorage as a simple store
// Replace with Supabase when you set up the project

export const localStore = {
  getTemplates: (): Record<string, unknown>[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('csv-standard-templates');
    return data ? JSON.parse(data) : [];
  },
  
  saveTemplate: (template: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const templates = localStore.getTemplates();
    const index = templates.findIndex((t: Record<string, unknown>) => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem('csv-standard-templates', JSON.stringify(templates));
  },
  
  getTemplate: (id: string): Record<string, unknown> | undefined => {
    const templates = localStore.getTemplates();
    return templates.find((t: Record<string, unknown>) => t.id === id || t.slug === id);
  },
  
  deleteTemplate: (id: string) => {
    if (typeof window === 'undefined') return;
    const templates = localStore.getTemplates().filter((t: Record<string, unknown>) => t.id !== id);
    localStorage.setItem('csv-standard-templates', JSON.stringify(templates));
  },
};
