import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface AdminRow {
  admin_id: number;
  admin_username: string;
  admin_status: number;
  role: string;
  last_login?: string;
  last_logout?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickLinkRow {
  id: string; // e.g. 'staff-corner', 'tpns', 'ptps'
  title_en: string;
  title_bm: string;
  href_en: string;
  href_bm: string;
  image_url?: string;
  available: boolean;
  external: boolean;
  sort_order?: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface DocumentRow {
  document_id: number;
  title_en: string;
  title_bm: string;
  category: string; // Annual Report, Tender Notice, Form, Publication
  file_url: string;
  file_size?: string;
  year?: number;
  download_count?: number;
  is_active?: boolean;
  created_by?: number;
  created_at?: string;
}

export interface SubsidiaryRow {
  subsidiary_id: number;
  name_en: string;
  name_bm: string;
  category?: string;
  logo_url?: string;
  website_url?: string;
  description_en?: string;
  description_bm?: string;
  contact_email?: string;
  contact_phone?: string;
  sort_order?: number;
}

export interface FeedbackRow {
  feedback_id?: number;
  full_name: string;
  email: string;
  phone_number?: string;
  subject: string;
  message: string;
  status?: number; // 1: New, 2: In Review, 3: Resolved
  resolved_by?: number;
  created_at?: string;
}
