// === Database Row Types ===

export interface ChurchInfo {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  pastor_name: string;
  service_times: string; // JSON string: {"domingo": ["08:00", "19:00"], "quarta": ["20:00"]}
  about: string;
  welcome_message: string;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: number;
  name: string;
  phone: string;
  city: string | null;
  prayer_request: string | null;
  how_they_found_us: string | null;
  visited_at: string;
  created_at: string;
}

export interface PrayerRequest {
  id: number;
  name: string;
  phone: string;
  request: string;
  is_anonymous: number; // 0 or 1
  prayed_for: number; // 0 or 1 (count as prayed)
  created_at: string;
}

export interface Leader {
  id: number;
  name: string;
  phone: string;
  role: string;
  email: string | null;
  department: string | null;
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  google_event_id: string | null; // ID do Google Calendar, se veio de lá
  title: string;
  description: string | null;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  location: string | null;
  event_type: string; // 'culto', 'evento', 'reuniao', 'outro'
  is_recurring: number; // 0 or 1
  source: string; // 'google_calendar' or 'manual'
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseEntry {
  id: number;
  question: string;
  answer: string;
  category: string | null; // ex: 'horarios', 'doacoes', 'contato', 'geral'
  keywords: string; // JSON array: ["horario", "culto", "domingo"]
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

// === API Request/Response Types ===

export interface CreateVisitorRequest {
  name: string;
  phone: string;
  city?: string;
  prayer_request?: string;
  how_they_found_us?: string;
}

export interface CreatePrayerRequest {
  name: string;
  phone: string;
  request: string;
  is_anonymous?: boolean;
}

export interface CreateKnowledgeBaseRequest {
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WeeklyReport {
  week_start: string; // ISO date
  week_end: string; // ISO date
  total_visitors: number;
  new_visitors: number;
  total_prayer_requests: number;
  upcoming_events: CalendarEvent[];
  birthdays_this_week: LeaderBirthday[];
}

export interface LeaderBirthday {
  name: string;
  phone: string;
  role: string;
  birthday_date: string; // format: "15 de agosto"
}