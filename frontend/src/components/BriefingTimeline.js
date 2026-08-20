import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';

const BriefingTimeline = () => {
  const [briefingItems, setBriefingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayBriefing();
  }, []);

  const fetchTodayBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getTodayBriefing();
      setBriefingItems(response.data);
    } catch (err) {
      console.error('Error fetching briefing:', err);
      setError('Failed to load briefing. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="timeline-loading">Loading your briefing...</div>;
  }

  if (error) {
    return (
      <div className="timeline-error">
        <p>{error}</p>
        <button onClick={fetchTodayBriefing}>Retry</button>
      </div>
    );
  }

  if (briefingItems.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No items for today. Check your connected services or try again later.</p>
      </div>
    );
  }

  // Group items by time of day for timeline view
  const morningItems = [];
  const afternoonItems = [];
  const eveningItems = [];

  briefingItems.forEach(item => {
    const hour = new Date(item.start || item.date || new Date()).getHours();
    if (hour < 12) {
      morningItems.push(item);
    } else if (hour < 17) {
      afternoonItems.push(item);
    } else {
      eveningItems.push(item);
    }
  });

  return (
    <div className="timeline-container">
      <h2>Today's Briefing</h2>
      <div className="timeline-section">
        <h3>Morning (6 AM - 12 PM)</h3>
        {morningItems.length > 0 ? (
          <div className="timeline-items">
            {morningItems.map(item => (
              <div key={item.id} className={`timeline-card ${item.type}`}>
                <div className="card-header">
                  <span className="type-icon">{getTypeIcon(item.type)}</span>
                  <span className="type-label">{getTypeLabel(item.type)}</span>
                  {item.urgencyScore !== undefined && (
                    <span className={`urgency-indicator urgency-${getUrgencyLevel(item.urgencyScore)}`}>
                      {getUrgencyLabel(item.urgencyScore)}
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.title || item.subject || 'No Title'}</h3>
                  <p className="card-description">
                    {item.description || item.snippet || ''}
                  </p>
                  <div className="card-meta">
                    <span className="card-time">
                      {formatTime(item.start || item.date)}
                    </span>
                    {item.location && (
                      <span className="card-location">📍 {item.location}</span>
                    )}
                    {item.from && (
                      <span className="card-sender">📧 {item.from}</span>
                    )}
                  </div>
                  <div className="card-actions">
                    {item.htmlLink && (
                      <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Calendar
                      </a>
                    )}
                    {item.gmailLink && (
                      <a href={item.gmailLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Gmail
                      </a>
                    )}
                    {item.html_url && (
                      <a href={item.html_url} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View on GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-empty">No morning items</p>
        )}
      </div>

      <div className="timeline-section">
        <h3>Afternoon (12 PM - 5 PM)</h3>
        {afternoonItems.length > 0 ? (
          <div className="timeline-items">
            {afternoonItems.map(item => (
              <div key={item.id} className={`timeline-card ${item.type}`}>
                <div className="card-header">
                  <span className="type-icon">{getTypeIcon(item.type)}</span>
                  <span className="type-label">{getTypeLabel(item.type)}</span>
                  {item.urgencyScore !== undefined && (
                    <span className={`urgency-indicator urgency-${getUrgencyLevel(item.urgencyScore)}`}>
                      {getUrgencyLabel(item.urgencyScore)}
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.title || item.subject || 'No Title'}</h3>
                  <p className="card-description">
                    {item.description || item.snippet || ''}
                  </p>
                  <div className="card-meta">
                    <span className="card-time">
                      {formatTime(item.start || item.date)}
                    </span>
                    {item.location && (
                      <span className="card-location">📍 {item.location}</span>
                    )}
                    {item.from && (
                      <span className="card-sender">📧 {item.from}</span>
                    )}
                  </div>
                  <div className="card-actions">
                    {item.htmlLink && (
                      <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Calendar
                      </a>
                    )}
                    {item.gmailLink && (
                      <a href={item.gmailLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Gmail
                      </a>
                    )}
                    {item.html_url && (
                      <a href={item.html_url} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View on GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-empty">No afternoon items</p>
        )}
      </div>

      <div className="timeline-section">
        <h3>Evening (5 PM - 10 PM)</h3>
        {eveningItems.length > 0 ? (
          <div className="timeline-items">
            {eveningItems.map(item => (
              <div key={item.id} className={`timeline-card ${item.type}`}>
                <div className="card-header">
                  <span className="type-icon">{getTypeIcon(item.type)}</span>
                  <span className="type-label">{getTypeLabel(item.type)}</span>
                  {item.urgencyScore !== undefined && (
                    <span className={`urgency-indicator urgency-${getUrgencyLevel(item.urgencyScore)}`}>
                      {getUrgencyLabel(item.urgencyScore)}
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.title || item.subject || 'No Title'}</h3>
                  <p className="card-description">
                    {item.description || item.snippet || ''}
                  </p>
                  <div className="card-meta">
                    <span className="card-time">
                      {formatTime(item.start || item.date)}
                    </span>
                    {item.location && (
                      <span className="card-location">📍 {item.location}</span>
                    )}
                    {item.from && (
                      <span className="card-sender">📧 {item.from}</span>
                    )}
                  </div>
                  <div className="card-actions">
                    {item.htmlLink && (
                      <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Calendar
                      </a>
                    )}
                    {item.gmailLink && (
                      <a href={item.gmailLink} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View in Gmail
                      </a>
                    )}
                    {item.html_url && (
                      <a href={item.html_url} target="_blank" rel="noopener noreferrer" className="btn-link">
                        View on GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-empty">No evening items</p>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getTypeIcon = (type) => {
  switch (type) {
    case 'calendar': return '📅';
    case 'email': return '📧';
    case 'github': return '💻';
    default: return '📄';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'calendar': return 'Calendar';
    case 'email': return 'Email';
    case 'github': return 'GitHub';
    default: return 'Item';
  }
};

const getUrgencyLevel = (score) => {
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

const getUrgencyLabel = (score) => {
  if (score >= 8) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return format(date, 'h:mm a');
  } catch (e) {
    return timeString;
  }
};

export default BriefingTimeline;