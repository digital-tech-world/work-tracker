const { google } = require('googleapis');
const tokenStore = require('./tokenStore');
const demoData = require('./demoData');

class CalendarService {
  constructor() {
    this.calendar = null;
    this.useDemoData = !(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    // Initialize will be called dynamically when credentials are available
  }

  initializeCalendar(clientId, clientSecret, refreshToken) {
    if (!clientId || !clientSecret || !refreshToken) {
      console.warn('Google Calendar credentials not fully configured');
      this.calendar = null;
      this.useDemoData = true;
      return false;
    }

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      // We'll set the redirect URI dynamically based on the request
      'http://localhost:5000/auth/google/callback' // Will be overridden per request
    );

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    this.useDemoData = false;
    return true;
  }

  isInitialized() {
    return this.calendar !== null;
  }

  async getTodayEvents() {
    if (this.useDemoData) {
      console.log('Using demo data for Calendar');
      return demoData.generateCalendarEvents();
    }

    if (!this.isInitialized()) {
      // Try to load from token store
      const tokens = tokenStore.getTokens('calendar');
      if (tokens && tokens.refresh_token) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (clientId && clientSecret) {
          this.initializeCalendar(clientId, clientSecret, tokens.refresh_token);
        }
      }

      if (!this.isInitialized()) {
        console.warn('Calendar service not initialized. Using demo data.');
        this.useDemoData = true;
        return demoData.generateCalendarEvents();
      }
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: today.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary || 'No Title',
        description: event.description || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location || '',
        attendees: event.attendees || [],
        status: event.status,
        htmlLink: event.htmlLink,
        type: 'calendar'
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      console.warn('Falling back to demo data for Calendar');
      this.useDemoData = true;
      return demoData.generateCalendarEvents();
    }
  }

  async getUpcomingEvents(hours = 24) {
    if (this.useDemoData) {
      console.log('Using demo data for Calendar (upcoming)');
      // For demo, just return today's events
      return demoData.generateCalendarEvents();
    }

    if (!this.isInitialized()) {
      // Try to load from token store
      const tokens = tokenStore.getTokens('calendar');
      if (tokens && tokens.refresh_token) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (clientId && clientSecret) {
          this.initializeCalendar(clientId, clientSecret, tokens.refresh_token);
        }
      }

      if (!this.isInitialized()) {
        console.warn('Calendar service not initialized. Using demo data.');
        this.useDemoData = true;
        return demoData.generateCalendarEvents();
      }
    }

    try {
      const now = new Date();
      const later = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: later.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary || 'No Title',
        description: event.description || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location || '',
        attendees: event.attendees || [],
        status: event.status,
        htmlLink: event.htmlLink,
        type: 'calendar'
      }));
    } catch (error) {
      console.error('Error fetching upcoming calendar events:', error);
      console.warn('Falling back to demo data for Calendar (upcoming)');
      this.useDemoData = true;
      return demoData.generateCalendarEvents();
    }
  }
}

module.exports = new CalendarService();