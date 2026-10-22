export interface AlbumPhotoRow {
  photo_id: number;
  album_id: number;
  image_url: string;
  caption_en?: string;
  caption_bm?: string;
  sort_order: number;
  created_by?: number;
  created_at?: string;
}

export interface AlbumRow {
  album_id: number;
  slug?: string;
  type: 'poster' | 'event';
  title_en: string;
  title_bm: string;
  description_en?: string;
  description_bm?: string;
  event_date?: string;
  event_end_date?: string;
  venue?: string;
  cta_label_en?: string;
  cta_label_bm?: string;
  cta_url?: string;
  is_featured: boolean;
  sort_order: number;
  status: number; // 1: Draft, 2: Published, 3: Archived
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  album_photos?: AlbumPhotoRow[];
}
