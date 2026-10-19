export interface AnnouncementRow {
  announcement_id: number;
  slug?: string;
  title_en: string;
  title_bm: string;
  content_en?: string;
  content_bm?: string;
  banner_url?: string;
  attachment_url?: string;
  status: number; // 1: Draft, 2: Published, 3: Archived
  is_pinned: boolean;
  published_at?: string;
  expires_at?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}
