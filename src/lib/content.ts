import type { SupabaseClient } from '@supabase/supabase-js';
import type { Settings, Stat, Step, Mistake, Area, Press, NewsItem } from './types';

// All fetchers fail soft: a Supabase hiccup returns []/null so the site never blanks.

async function list<T>(sb: SupabaseClient, table: string): Promise<T[]> {
  try {
    const { data, error } = await sb.from(table).select('*').order('sort', { ascending: true });
    if (error) throw error;
    return (data as T[]) ?? [];
  } catch {
    return [];
  }
}

export const getStats = (sb: SupabaseClient) => list<Stat>(sb, 'stats');
export const getSteps = (sb: SupabaseClient) => list<Step>(sb, 'process_steps');
export const getMistakes = (sb: SupabaseClient) => list<Mistake>(sb, 'mistakes');
export const getAreas = (sb: SupabaseClient) => list<Area>(sb, 'areas');
export const getPress = (sb: SupabaseClient) => list<Press>(sb, 'press');

export async function getSettings(sb: SupabaseClient): Promise<Settings | null> {
  try {
    const { data, error } = await sb.from('site_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return data as Settings;
  } catch {
    return null;
  }
}

export async function getSection(sb: SupabaseClient, page: string, slot: string): Promise<string | null> {
  try {
    const { data, error } = await sb.from('page_sections').select('value').eq('page', page).eq('slot', slot).single();
    if (error) throw error;
    return (data?.value as string) ?? null;
  } catch {
    return null;
  }
}

export async function getNews(sb: SupabaseClient, opts: { publishedOnly?: boolean } = {}): Promise<NewsItem[]> {
  try {
    let q = sb.from('news').select('*').order('date', { ascending: false });
    if (opts.publishedOnly) q = q.eq('published', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data as NewsItem[]) ?? [];
  } catch {
    return [];
  }
}
