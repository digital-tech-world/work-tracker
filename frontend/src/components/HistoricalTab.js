import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';

const HistoricalTab = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await api.getHistoricalBriefing(dateString);
      setHistoricalData(response.data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return <div className="historical-loading">Loading historical data...</div>;
  }

  if (error) {
    return (
      <div className="historical-error">
        <p>{error}</p>
        <button onClick={fetchHistoricalData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="historical-container">
      <h2>Historical Briefings</h2>

      <div className="date-picker">
        <label htmlFor="date-input">Select Date:</label>
        <input
          type="date"
          id="date-input"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange(new Date(e.target.value))}
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {historicalData.length === 0 ? (
        <div className="historical-empty">
          <p>No briefing data available for the selected date.</p>
          <p>Note: Historical data persistence is not implemented in the MVP version.</p>
        </div>
      ) : (
        <div className="historical-items">
          {historicalData.map(item => (
            <div key={item.id} className={`historical-card ${item.type}`}>
              <div className="card-header">
                <span className="type-icon">{getTypeIcon(item.type)}</span>
                <span className="type-label">{getTypeLabel(item.type)}</span>
                <span className="card-date">
                  {format(new Date(item.start || item.date), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{item.title || item.subject || 'No Title'}</h3>
                <p className="card-description">
                  {item.description || item.snippet || ''}
                </p>
                <div className="card-meta">
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
      )}
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

export default HistoricalTab;