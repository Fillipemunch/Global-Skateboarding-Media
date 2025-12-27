import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseKey = 'SUA_CHAVE_ANON_DO_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return data;
};
