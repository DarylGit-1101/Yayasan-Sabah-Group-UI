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
