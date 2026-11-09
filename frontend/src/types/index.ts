export interface User {
  id: number;
  name: string;
  email: string;
}

export type TimeSlot =
  | 'Morning (fasting)'
  | 'After breakfast'
  | 'After lunch'
  | 'After dinner';

export interface Reading {
  id: number;
  user_id: number;
  reading_date: string;
  time_slot: TimeSlot;
  glucose_value: number;
  created_at: string;
  updated_at: string;
}

export interface ReportStats {
  report_type: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  has_data: boolean;
  total_readings: number;
  highest: number | null;
  lowest: number | null;
  average: number | null;
  readings?: Reading[];
  message: string | null;
}
