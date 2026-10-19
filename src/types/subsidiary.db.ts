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
