
import { createClient } from '@supabase/supabase-js';
import { SkateNewsItem } from '../types';

// These should be set in the environment
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const getSkateNews = async (): Promise<SkateNewsItem[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('skate_news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
  
  return data || [];
};

export const syncNewsToSupabase = async (newsItems: SkateNewsItem[]) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('skate_news')
    .insert(newsItems);

  if (error) {
    console.error('Error syncing to Supabase:', error);
    throw error;
  }
};

export const isSupabaseConfigured = () => !!supabase;
