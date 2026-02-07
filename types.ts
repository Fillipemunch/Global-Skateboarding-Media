
export type NewsCategory = 'industry' | 'culture' | 'video_parts' | 'event_2025_recap' | 'event_2026_schedule' | 'brand_history';

export interface SkateNewsItem {
  id?: number;
  created_at?: string;
  category: NewsCategory;
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
