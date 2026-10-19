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
