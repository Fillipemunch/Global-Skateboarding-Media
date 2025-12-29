import { createClient } from '@supabase/supabase-js';

// Suas chaves reais configuradas
const supabaseUrl = 'https://ychdbnvlavthuxyqilao.supabase.co';
const supabaseKey = 'sb_publishable_EF3NOnSYjESYEboB3MeSsA_fKLVjcq-';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchNews = async () => {
  const { data, error } = await supabase
    .from('news') // Verifique se sua tabela no Supabase chama-se 'news'
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Erro ao buscar notícias:', error.message);
    throw error;
  }
  return data;
};
