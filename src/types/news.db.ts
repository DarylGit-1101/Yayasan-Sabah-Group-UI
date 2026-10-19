export interface NewsRow {
  news_id: number;
  slug: string;
  title_en: string;
  title_bm: string;
  excerpt_en?: string;
  excerpt_bm?: string;
  content_en: string;
  content_bm: string;
  cover_image_url?: string;
  category?: string;
  status: number; // 1: Draft, 2: Published, 3: Archived
  is_featured: boolean;
  view_count: number;
  published_at?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}
