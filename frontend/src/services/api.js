import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const getAuthStatus = () => api.get('/auth/status');
export const getGoogleAuthUrl = () => api.get('/auth/google');
export const getGmailAuthUrl = () => api.get('/auth/gmail');

// Briefing endpoints
export const getTodayBriefing = () => api.get('/briefing/today');
export const getHistoricalBriefing = (date) => api.get(`/briefing/historical?date=${date}`);
export const getTodayCalendar = () => api.get('/calendar/today');
export const getTodayEmails = () => api.get('/email/today');
export const getTodayGitHub = () => api.get('/github/today');

export default api;