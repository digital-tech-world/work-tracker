import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BriefingTimeline from './components/BriefingTimeline';
import HistoricalTab from './components/HistoricalTab';
import AuthPrompt from './components/AuthPrompt';
import api from './services/api';

function App() {
  const [authStatus, setAuthStatus] = useState({
    calendar: false,
    gmail: false,
    github: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.getAuthStatus();
      setAuthStatus({
        calendar: response.data.calendar.initialized,
        gmail: response.data.gmail.initialized,
        github: response.data.github.initialized
      });
    } catch (error) {
      console.error('Failed to check auth status:', error);
      // Assume not authenticated if we can't check
      setAuthStatus({
        calendar: false,
        gmail: false,
        github: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Checking authentication...</div>;
  }

  // Check if any service is not authenticated
  const isAnyServiceMissing = !(
    authStatus.calendar &&
    authStatus.gmail &&
    authStatus.github
  );

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Life Dashboard</h1>
          <p>Your daily briefing</p>
        </header>
        {isAnyServiceMissing ? (
          <AuthPrompt authStatus={authStatus} onAuthStatusChange={checkAuthStatus} />
        ) : (
          <>
            <nav className="App-nav">
              <button onClick={() => window.location.href = '/'}>{'Today\'s Briefing'}</button>
              <button onClick={() => window.location.href = '/historical'}>Historical Data</button>
            </nav>
            <Routes>
              <Route path="/" element={<BriefingTimeline />} />
              <Route path="/historical" element={<HistoricalTab />} />
            </Routes>
          </>
        )}
        <footer className="App-footer">
          <p>Life Dashboard v1.0</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;