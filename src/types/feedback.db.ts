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
