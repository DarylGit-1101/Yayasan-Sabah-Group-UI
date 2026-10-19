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
