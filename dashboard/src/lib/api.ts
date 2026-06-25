// API Client for Prospera AI Dashboard

const IS_SERVER = typeof window === 'undefined';
const API_BASE_URL = IS_SERVER 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ChurchInfo {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  pastor_name: string;
  service_times: string; // JSON: {"domingo": ["08:00","19:00"], "quarta": ["20:00"]}
  about: string;
  welcome_message: string;
}

export interface Visitor {
  id: number;
  name: string;
  phone: string;
  city: string | null;
  prayer_request: string | null;
  how_they_found_us: string | null;
  visited_at: string;
}

export interface PrayerRequest {
  id: number;
  name: string;
  phone: string;
  request: string;
  is_anonymous: boolean;
  prayed_for: number;
  created_at?: string;
}

export interface PrayerRequestStats {
  total: number;
  today: number;
  total_orado: number;
}

export interface Leader {
  id: number;
  name: string;
  phone: string;
  role: string;
  email: string | null;
  department: string | null;
  birth_date: string | null;
  is_active: boolean;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  event_type: 'culto' | 'evento' | 'reuniao' | 'outro';
  source: 'google_calendar' | 'manual';
}

export interface KnowledgeBaseEntry {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  keywords: string[];
  is_active: boolean;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP Error ${res.status}: ${errorText}`);
  }

  const json: ApiResponse<T> = await res.json();
  
  if (!json.success) {
    throw new Error(json.error || 'Erro na requisição');
  }

  return json.data;
}

// Service functions
export const api = {
  // Church Info
  getChurchInfo: () => request<ChurchInfo>('/info'),
  updateChurchInfo: (info: Partial<ChurchInfo>) => request<ChurchInfo>('/info', {
    method: 'PUT',
    body: JSON.stringify(info),
  }),

  // Visitors
  getVisitors: (limit = 50, offset = 0) => request<Visitor[]>(`/visitors?limit=${limit}&offset=${offset}`),
  getVisitorsToday: () => request<Visitor[]>('/visitors/today'),
  getVisitorDetails: (id: number) => request<Visitor>(`/visitors/${id}`),

  // Prayer Requests
  getPrayerRequests: () => request<PrayerRequest[]>('/prayer-requests'),
  getPrayerRequestStats: () => request<PrayerRequestStats>('/prayer-requests/stats'),
  markAsPrayed: (id: number) => request<void>(`/prayer-requests/${id}/prayed`, { method: 'PUT' }),

  // Leadership
  getLeaders: (department?: string, active = true) => 
    request<Leader[]>(`/leaders?active=${active}${department ? `&department=${department}` : ''}`),
  createLeader: (leader: Omit<Leader, 'id' | 'is_active'>) => request<Leader>('/leaders', {
    method: 'POST',
    body: JSON.stringify(leader),
  }),
  updateLeader: (id: number, leader: Partial<Leader>) => request<Leader>(`/leaders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(leader),
  }),
  deleteLeader: (id: number) => request<void>(`/leaders/${id}`, { method: 'DELETE' }),

  // Calendar
  getEvents: (period?: 'today' | 'week', limit = 10) => 
    request<CalendarEvent[]>(`/events?limit=${limit}${period ? `&period=${period}` : ''}`),
  syncCalendar: () => request<void>('/events/sync', { method: 'POST' }),
  createEvent: (event: Omit<CalendarEvent, 'id' | 'source'>) => request<CalendarEvent>('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  }),
  deleteEvent: (id: number) => request<void>(`/events/${id}`, { method: 'DELETE' }),

  // Knowledge Base
  getKnowledgeBase: (category?: string, search?: string) => 
    request<KnowledgeBaseEntry[]>(`/knowledge-base?category=${category || ''}&search=${search || ''}`),
  getKnowledgeBaseEntry: (id: number) => request<KnowledgeBaseEntry>(`/knowledge-base/${id}`),
  createKnowledgeBaseEntry: (entry: Omit<KnowledgeBaseEntry, 'id'>) => request<KnowledgeBaseEntry>('/knowledge-base', {
    method: 'POST',
    body: JSON.stringify(entry),
  }),
  updateKnowledgeBaseEntry: (id: number, entry: Partial<KnowledgeBaseEntry>) => 
    request<KnowledgeBaseEntry>(`/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    }),
  deleteKnowledgeBaseEntry: (id: number) => request<void>(`/knowledge-base/${id}`, { method: 'DELETE' }),

  // Reports
  getWeeklyReport: () => request<any>('/reports/weekly'),

  // Announcements
  sendAnnouncement: (data: { target: string, message: string }) => request<void>('/leaders/message', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
