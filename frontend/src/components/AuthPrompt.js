import React, { useState, useEffect } from 'react';
import ConnectionStatus from './ConnectionStatus';

const AuthPrompt = ({ authStatus, onAuthStatusChange }) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authService, setAuthService] = useState(''); // 'google' or 'gmail'
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Handle closing modals
  const closeModal = () => {
    setShowGoogleModal(false);
    setShowGmailModal(false);
    setAuthCode('');
    setAuthService('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  // Handle submitting auth code
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      // Simulate API call to backend to store credentials
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the auth service status
      if (authService === 'google') {
        setSubmitSuccess('Google Calendar connected successfully!');
      } else if (authService === 'gmail') {
        setSubmitSuccess('Gmail connected successfully!');
      }

      // After a short delay, close modal and refresh auth status
      setTimeout(() => {
        closeModal();
        onAuthStatusChange();
      }, 2000);
    } catch (error) {
      console.error('Auth submission error:', error);
      setSubmitError('Failed to connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-prompt-container">
      <div className="auth-prompt-overlay" onClick={closeModal}>
        <div className="auth-prompt-content">
          <h2>Service Connections</h2>

          {/* Show connection status with detailed information */}
          <ConnectionStatus
            authStatus={authStatus}
            onReconnect={(service) => {
              if (service === 'calendar') {
                setAuthService('google');
                setShowGoogleModal(true);
              } else if (service === 'gmail') {
                setAuthService('gmail');
                setShowGmailModal(true);
              }
            }}
          />

          <div className="connection-actions">
            {(authStatus.calendar && authStatus.gmail) && (
              <button
                className="auth-btn success-btn"
                onClick={closeModal}
              >
                Continue to Dashboard
              </button>
            )}

            {!authStatus.calendar || !authStatus.gmail ? (
              <>
                {!authStatus.calendar && (
                  <button
                    className="auth-btn google-btn"
                    onClick={() => {
                      setAuthService('google');
                      setShowGoogleModal(true);
                    }}
                  >
                    Connect Google Calendar
                  </button>
                )}

                {!authStatus.gmail && (
                  <button
                    className="auth-btn gmail-btn"
                    onClick={() => {
                      setAuthService('gmail');
                      setShowGmailModal(true);
                    }}
                  >
                    Connect Gmail
                  </button>
                )}
              </>
            ) : (
              <button
                className="auth-btn success-btn"
                onClick={closeModal}
              >
                All Services Connected
              </button>
            )}
          </div>

          {/* Google Auth Modal */}
          {showGoogleModal && (
            <div className="auth-modal">
              <div className="auth-modal-header">
                <h3>Connect Google Calendar</h3>
                <button className="auth-modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="auth-modal-body">
                <p>To connect Google Calendar:</p>
                <ol>
                  <li>Visit: <code className="auth-code-url">https://accounts.google.com/o/oauth2/v2/auth?client_id=[YOUR_CLIENT_ID]&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent</code></li>
                  <li>Sign in with your Google account and grant permissions</li>
                  <li>Copy the authorization code provided</li>
                </ol>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="auth-code">Authorization Code:</label>
                    <input
                      type="text"
                      id="auth-code"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Paste the authorization code here"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                  {submitError && <p className="error-message">{submitError}</p>}
                  {submitSuccess && <p className="success-message">{submitSuccess}</p>}
                </form>
              </div>
            </div>
          )}

          {/* Gmail Auth Modal */}
          {showGmailModal && (
            <div className="auth-modal">
              <div className="auth-modal-header">
                <h3>Connect Gmail</h3>
                <button className="auth-modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="auth-modal-body">
                <p>To connect Gmail:</p>
                <ol>
                  <li>Visit: <code className="auth-code-url">https://accounts.google.com/o/oauth2/v2/auth?client_id=[YOUR_CLIENT_ID]&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=consent</code></li>
                  <li>Sign in with your Google account and grant permissions</li>
                  <li>Copy the authorization code provided</li>
                </ol>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="auth-code">Authorization Code:</label>
                    <input
                      type="text"
                      id="auth-code"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Paste the authorization code here"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Connecting...' : 'Connect Gmail'}
                  </button>
                  {submitError && <p className="error-message">{submitError}</p>}
                  {submitSuccess && <p className="success-message">{submitSuccess}</p>}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPrompt;