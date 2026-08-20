/**
 * Date helper functions for the Life Dashboard
 */

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

export const isToday = (dateString) => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (e) {
    return false;
  }
};

export const getHoursUntil = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const now = new Date();
    return (date - now) / (1000 * 60 * 60);
  } catch (e) {
    return null;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(date - now);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Less than 1 hour ago';
    } else if (diffHours === 1) {
      return 'About 1 hour ago';
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} hours ago`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  } catch (e) {
    return dateString;
  }
};

export const getTimeOfDay = (dateString) => {
  if (!dateString) return 'unknown';
  try {
    const date = new Date(dateString);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  } catch (e) {
    return 'unknown';
  }
};