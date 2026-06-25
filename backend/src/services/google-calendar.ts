import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'googleapis-common';
import db from '../db/connection';
import dotenv from 'dotenv';

dotenv.config();

const CALENDAR_ID = process.env.CALENDAR_ID || '';
const MAX_EVENTS = 50;

/**
 * Creates an authenticated Google Calendar client.
 * Supports both Service Account (file) and direct credentials.
 */
function getCalendarClient(): calendar_v3.Calendar {
  let auth: JWT;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    // Direct credential env vars
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
  } else {
    // Default: use GOOGLE_APPLICATION_CREDENTIALS file
    const authRaw = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    return google.calendar({ version: 'v3', auth: authRaw });
  }

  return google.calendar({ version: 'v3', auth });
}

/**
 * Fetches upcoming events from Google Calendar and syncs them to local DB.
 */
export async function syncCalendarEvents(): Promise<number> {
  try {
    const calendar = getCalendarClient();
    const now = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: twoMonthsFromNow.toISOString(),
      maxResults: MAX_EVENTS,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    let syncedCount = 0;

    const insertStmt = db.prepare(`
      INSERT INTO calendar_events (google_event_id, title, description, start_time, end_time, location, event_type, is_recurring, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'google_calendar')
      ON CONFLICT(google_event_id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        location = excluded.location,
        event_type = excluded.event_type,
        is_recurring = excluded.is_recurring,
        updated_at = datetime('now', '-3 hours')
    `);

    const transaction = db.transaction(() => {
      for (const event of events) {
        const eventId = event.id;
        if (!eventId) continue;

        const title = event.summary || 'Sem título';
        const description = event.description || null;
        const startTime = event.start?.dateTime || event.start?.date || '';
        const endTime = event.end?.dateTime || event.end?.date || '';
        const location = event.location || null;
        const isRecurring = event.recurrence ? 1 : 0;

        // Inferir tipo do evento pelo título
        let eventType = 'evento';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('culto') || titleLower.includes('domingo') || titleLower.includes('célula')) {
          eventType = 'culto';
        } else if (titleLower.includes('reunião') || titleLower.includes('reuniao')) {
          eventType = 'reuniao';
        }

        insertStmt.run(eventId, title, description, startTime, endTime, location, eventType, isRecurring);
        syncedCount++;
      }
    });

    transaction();
    console.log(`✅ Synced ${syncedCount} events from Google Calendar`);
    return syncedCount;
  } catch (error) {
    console.error('❌ Error syncing Google Calendar:', error);
    throw error;
  }
}

/**
 * Fetches upcoming events from local cache (already synced).
 */
export function getUpcomingEvents(limit: number = 10): any[] {
  const now = new Date().toISOString();
  return db.prepare(`
    SELECT * FROM calendar_events
    WHERE start_time >= ?
    ORDER BY start_time ASC
    LIMIT ?
  `).all(now, limit);
}

/**
 * Fetches today's events.
 */
export function getTodayEvents(): any[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return db.prepare(`
    SELECT * FROM calendar_events
    WHERE start_time >= ? AND start_time <= ?
    ORDER BY start_time ASC
  `).all(today.toISOString(), todayEnd.toISOString());
}

/**
 * Fetches this week's events (Monday to Sunday).
 */
export function getThisWeekEvents(): any[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Go back to Monday
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return db.prepare(`
    SELECT * FROM calendar_events
    WHERE start_time >= ? AND start_time <= ?
    ORDER BY start_time ASC
  `).all(monday.toISOString(), sunday.toISOString());
}