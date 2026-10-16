import type { GoogleCalendarEvent } from '../types.ts';
import { getAccessToken } from './firebaseAuth.ts';

export async function fetchCalendarEvents(dateStr?: string): Promise<GoogleCalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Calendar access token is not available. Please connect Google Calendar.');
  }

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');

  if (dateStr) {
    // Parse YYYY-MM-DD in local time
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const startOfDay = new Date(y, m, d, 0, 0, 0, 0).toISOString();
    const endOfDay = new Date(y, m, d, 23, 59, 59, 999).toISOString();
    url.searchParams.append('timeMin', startOfDay);
    url.searchParams.append('timeMax', endOfDay);
  } else {
    // Default: fetch from start of today to 14 days out
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
    const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    url.searchParams.append('timeMin', startOfToday);
    url.searchParams.append('timeMax', futureDate);
  }

  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  url.searchParams.append('maxResults', '150');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    try {
      localStorage.removeItem('gcal_oauth_access_token');
      localStorage.removeItem('gcal_token_timestamp');
    } catch {
      // ignore
    }
    throw new Error('Google Calendar session expired. Please tap to re-authenticate with Google.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch calendar events (HTTP ${res.status})`
    );
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

export async function fetchCalendarEventsForMonth(year: number, monthIndex: number): Promise<GoogleCalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) return [];

  // Start of month (or last days of prev month)
  const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0).toISOString();
  // End of month
  const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('timeMin', startOfMonth);
  url.searchParams.append('timeMax', endOfMonth);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  url.searchParams.append('maxResults', '250');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) {
    try {
      localStorage.removeItem('gcal_oauth_access_token');
      localStorage.removeItem('gcal_token_timestamp');
    } catch {
      // ignore
    }
    return [];
  }

  if (!res.ok) return [];

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

export async function createGoogleCalendarEvent(
  title: string,
  dateStr: string,
  startTime: string,
  endTime: string,
  description?: string
): Promise<GoogleCalendarEvent> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Calendar access token is not available. Please sign in with Google.');
  }

  const startDateTime = `${dateStr}T${startTime}:00`;
  const endDateTime = `${dateStr}T${endTime}:00`;

  const payload = {
    summary: title,
    description: description || 'Created from Chronos Flow Daily Tasks',
    start: {
      dateTime: new Date(startDateTime).toISOString(),
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    try {
      localStorage.removeItem('gcal_oauth_access_token');
      localStorage.removeItem('gcal_token_timestamp');
    } catch {
      // ignore
    }
    throw new Error('Google Calendar session expired. Please tap to re-authenticate with Google.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create calendar event (HTTP ${res.status})`
    );
  }

  return (await res.json()) as GoogleCalendarEvent;
}
