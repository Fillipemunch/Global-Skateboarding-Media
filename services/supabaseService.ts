import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ychdbnvlavthuxyqilao.supabase.co';
const supabaseKey = 'sb_publishable_EF3NOnSYjESYEboB3MeSsA_fKLVjcq-';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return data;
};
