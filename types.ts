
export type NewsCategory = 'industry' | 'culture' | 'video_parts' | 'event_2025_recap' | 'event_2026_schedule' | 'brand_history';

export interface SkateNewsItem {
  id?: number | string;
  created_at?: string;
  date?: string; // Published date (e.g. DD/MM/YYYY)
  category: NewsCategory;
  region?: 'BRAZIL' | 'EUROPE' | 'USA' | 'GLOBAL';
  title: string;
  summary: string;
  content: string; 
  url: string;
  is_hero: boolean;
  youtube_id?: string;
  image_url?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
