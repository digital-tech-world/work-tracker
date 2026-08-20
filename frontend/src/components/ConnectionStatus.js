import React from 'react';

const ConnectionStatus = ({ authStatus, onReconnect }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="connection-status-container">
      <h2>Connected Services</h2>

      <div className="service-connections">
        <div className={`connection-card ${authStatus.calendar.initialized ? 'connected' : 'disconnected'}`}>
          <div className="connection-header">
            <h3>Google Calendar</h3>
            {authStatus.calendar.initialized ? (
              <button className="reconnect-btn" onClick={() => onReconnect('calendar')}>
                Reconnect
              </button>
            ) : (
              <button className="connect-btn" onClick={() => onReconnect('calendar')}>
                Connect
              </button>
            )}
          </div>

          {authStatus.calendar.profile && (
            <div className="profile-info">
              <img
                src={authStatus.calendar.profile.picture}
                alt={`${authStatus.calendar.profile.name}'s profile`}
                className="profile-picture"
              />
              <div className="profile-details">
                <p className="profile-name">{authStatus.calendar.profile.name}</p>
                <p className="profile-email">{authStatus.calendar.profile.email}</p>
              </div>
            </div>
          )}

          <div className="connection-meta">
            <span className="meta-item">
              <span className="meta-label">Status:</span>
              <span className={authStatus.calendar.tokenValid ? 'status-valid' : 'status-invalid'}>
                {authStatus.calendar.tokenValid ? 'Connected' : 'Token Expired'}
              </span>
            </span>
            <span className="meta-item">
              <span className="meta-label">Expires:</span>
              <span>{formatDate(authStatus.calendar.tokenExpiresAt)}</span>
            </span>
          </div>
        </div>

        <div className={`connection-card ${authStatus.gmail.initialized ? 'connected' : 'disconnected'}`}>
          <div className="connection-header">
            <h3>Gmail</h3>
            {authStatus.gmail.initialized ? (
              <button className="reconnect-btn" onClick={() => onReconnect('gmail')}>
                Reconnect
              </button>
            ) : (
              <button className="connect-btn" onClick={() => onReconnect('gmail')}>
                Connect
              </button>
            )}
          </div>

          {authStatus.gmail.profile && (
            <div className="profile-info">
              <img
                src={authStatus.gmail.profile.picture}
                alt={`${authStatus.gmail.profile.name}'s profile`}
                className="profile-picture"
              />
              <div className="profile-details">
                <p className="profile-name">{authStatus.gmail.profile.name}</p>
                <p className="profile-email">{authStatus.gmail.profile.email}</p>
              </div>
            </div>
          )}

          <div className="connection-meta">
            <span className="meta-item">
              <span className="meta-label">Status:</span>
              <span className={authStatus.gmail.tokenValid ? 'status-valid' : 'status-invalid'}>
                {authStatus.gmail.tokenValid ? 'Connected' : 'Token Expired'}
              </span>
            </span>
            <span className="meta-item">
              <span className="meta-label">Expires:</span>
              <span>{formatDate(authStatus.gmail.tokenExpiresAt)}</span>
            </span>
          </div>
        </div>
      </div>

      {(!authStatus.calendar.initialized || !authStatus.gmail.initialized) && (
        <div className="connection-actions">
          <button
            className="primary-btn"
            onClick={() => {
              // Trigger refresh of auth status
              window.location.reload();
            }}
          >
            Refresh Connection Status
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;