const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();
console.log('Dotenv loaded');

console.log('Starting Life Dashboard backend...');

const app = express();
const PORT = process.env.PORT || 5000;

// Cookie secret for signing cookies
const COOKIE_SECRET = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Import services
const calendarService = require('./services/calendarService');
const emailService = require('./services/emailService');
const briefingService = require('./services/briefingService');
const tokenStore = require('./services/tokenStore');

// GitHub configuration
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

if (!GITHUB_PAT || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
  console.error('Missing required environment variables: GITHUB_PAT, GITHUB_REPO_OWNER, GITHUB_REPO_NAME');
  process.exit(1);
}

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${GITHUB_PAT}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

// Helper to handle GitHub API errors
const handleGitHubError = (res, error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    res.status(error.response.status).json({
      error: error.response.data.message || 'GitHub API error',
    });
  } else if (error.request) {
    // The request was made but no response was received
    res.status(500).json({ error: 'No response from GitHub API' });
  } else {
    // Something happened in setting up the request
    res.status(500).json({ error: error.message });
  }
};

// Enhanced GitHub routes with better filtering and prioritization
// GET /api/issues - Enhanced to better identify tasks and notes
app.get('/api/issues', async (req, res) => {
  try {
    const { labels, state, ...params } = req.query;
    const queryParams = {
      ...params,
      ...(labels && { labels }),
      ...(state && { state }),
      per_page: 100,
    };
    const response = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      { params: queryParams }
    );
    // Filter out pull requests (GitHub API returns pull requests as issues with a pull_request property)
    const issues = response.data.filter(issue => !issue.pull_request);

    // Enhance with task-like identification
    const enhancedIssues = issues.map(issue => ({
      ...issue,
      // Identify if this looks like a task/note based on labels or title
      isTaskLike: (
        (issue.labels || []).some(label =>
          ['task', 'todo', 'note', 'idea'].includes(label.name.toLowerCase())
        ) ||
        /^(task|todo|note|idea[- ])/i.test(issue.title)
      ),
      // Priority based on labels
      priorityLevel: (
        (issue.labels || []).some(label =>
          ['urgent', 'high-priority', 'blocker', 'critical'].includes(label.name.toLowerCase())
        ) ? 'high' :
        (issue.labels || []).some(label =>
          ['medium', 'normal'].includes(label.name.toLowerCase())
        ) ? 'medium' : 'low'
      )
    }));

    res.json(enhancedIssues);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// POST /api/issues
app.post('/api/issues', async (req, res) => {
  try {
    const { title, body, labels = [] } = req.body;
    const response = await githubApi.post(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      { title, body, labels }
    );
    res.status(201).json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// PATCH /api/issues/:number
app.patch('/api/issues/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const updateData = req.body;
    const response = await githubApi.patch(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues/${number}`,
      updateData
    );
    res.json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// DELETE /api/issues/:number (close issue)
app.delete('/api/issues/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const response = await githubApi.patch(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues/${number}`,
      { state: 'closed' }
    );
    res.json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// Routes for Documents (files in the `documents` directory)
// GET /api/documents
app.get('/api/documents', async (req, res) => {
  try {
    const response = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/documents`
    );
    // If the directory exists, we get an array of files
    if (Array.isArray(response.data)) {
      // Map to return file info: name, path, download_url, type, size
      const files = response.data.map(file => ({
        name: file.name,
        path: file.path,
        download_url: file.download_url,
        type: file.type,
        size: file.size,
      }));
      res.json(files);
    } else {
      // If the directory doesn't exist, GitHub API returns an object (means it's a file? but we requested a dir)
      // We'll treat as empty
      res.json([]);
    }
  } catch (error) {
    // If the directory doesn't exist, we get a 404
    if (error.response && error.response.status === 404) {
      res.json([]); // Return empty array
    } else {
      handleGitHubError(res, error);
    }
  }
});

// POST /api/documents
app.post('/api/documents', async (req, res) => {
  try {
    const { name, content } = req.body; // content should be base64 encoded string
    const path = `documents/${name}`;
    // Check if file already exists
    let exists = false;
    let sha = '';
    try {
      const getResponse = await githubApi.get(
        `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`
      );
      exists = true;
      sha = getResponse.data.sha;
    } catch (err) {
      // Ignore 404
    }

    const requestData = {
      message: exists ? `Update document ${name}` : `Add document ${name}`,
      content: Buffer.from(content).toString('base64'),
    };
    if (exists) {
      requestData.sha = sha;
    }

    const response = await githubApi.put(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
      requestData
    );
    res.status(201).json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// DELETE /api/documents/:filename
app.delete('/api/documents/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const path = `documents/${filename}`;
    // Get the file to obtain its SHA
    const getResponse = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`
    );
    const { sha } = getResponse.data;

    const response = await githubApi.delete(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
      {
        data: {
          message: `Delete document ${filename}`,
          sha,
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// Similar routes for Links (files in the `links` directory)
// GET /api/links
app.get('/api/links', async (req, res) => {
  try {
    const response = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/links`
    );
    if (Array.isArray(response.data)) {
      const links = response.data.map(link => ({
        name: link.name,
        path: link.path,
        download_url: link.download_url,
        type: link.type,
        size: link.size,
      }));
      res.json(links);
    } else {
      res.json([]);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.json([]);
    } else {
      handleGitHubError(res, error);
    }
  }
});

// POST /api/links
app.post('/api/links', async (req, res) => {
  try {
    const { name, content } = req.body; // content should be base64 encoded string (e.g., the URL or a JSON object)
    const path = `links/${name}`;
    let exists = false;
    let sha = '';
    try {
      const getResponse = await githubApi.get(
        `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`
      );
      exists = true;
      sha = getResponse.data.sha;
    } catch (err) {
      // Ignore 404
    }

    const requestData = {
      message: exists ? `Update link ${name}` : `Add link ${name}`,
      content: Buffer.from(content).toString('base64'),
    };
    if (exists) {
      requestData.sha = sha;
    }

    const response = await githubApi.put(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
      requestData
    );
    res.status(201).json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// DELETE /api/links/:filename
app.delete('/api/links/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const path = `links/${filename}`;
    const getResponse = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`
    );
    const { sha } = getResponse.data;

    const response = await githubApi.delete(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
      {
        data: {
          message: `Delete link ${filename}`,
          sha,
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// ======================
// NEW SERVICES & ENDPOINTS
// ======================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      calendar: calendarService.isInitialized(),
      gmail: emailService.isInitialized(),
      github: !!GITHUB_PAT
    }
  });
});

// Authentication status endpoint
app.get('/api/auth/status', (req, res) => {
  const calendarTokens = tokenStore.getTokens('calendar');
  const gmailTokens = tokenStore.getTokens('gmail');
  const calendarProfile = tokenStore.getProfile('calendar');
  const gmailProfile = tokenStore.getProfile('gmail');

  const calendarIsConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
  const gmailIsConfigured = !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET
  );

  // Check if tokens exist and are not expired (with 5 minute buffer)
  const isCalendarValid = calendarTokens &&
    calendarTokens.expiry_date &&
    Date.now() < calendarTokens.expiry_date - 5 * 60 * 1000; // 5 minutes buffer

  const isGmailValid = gmailTokens &&
    gmailTokens.expiry_date &&
    Date.now() < gmailTokens.expiry_date - 5 * 60 * 1000; // 5 minutes buffer

  res.json({
    calendar: {
      configured: calendarIsConfigured,
      initialized: calendarService.isInitialized(),
      tokenValid: isCalendarValid,
      tokenExpiresAt: calendarTokens ? new Date(calendarTokens.expiry_date).toISOString() : null,
      profile: calendarProfile
    },
    gmail: {
      configured: gmailIsConfigured,
      initialized: emailService.isInitialized(),
      tokenValid: isGmailValid,
      tokenExpiresAt: gmailTokens ? new Date(gmailTokens.expiry_date).toISOString() : null,
      profile: gmailProfile
    },
    github: {
      configured: !!(
        process.env.GITHUB_PAT &&
        process.env.GITHUB_REPO_OWNER &&
        process.env.GITHUB_REPO_NAME
      ),
      initialized: true // If configured, it's initialized (we assume PAT is always valid until changed)
    }
  });
});

// Revoke tokens for a service
app.delete('/api/auth/revoke/:service', (req, res) => {
  const { service } = req.params;
  if (!['calendar', 'gmail'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service. Must be calendar or gmail' });
  }

  tokenStore.removeTokens(service);
  // Also reset the service instance to force re-initialization on next use
  if (service === 'calendar') {
    // We don't have a direct way to reset the calendarService instance, but the next call to getTodayEvents will try to load from tokenStore (which is now empty) and then fail to initialize
    // So we just rely on the tokenStore being empty and the service will be uninitialized until new tokens are stored.
  } else if (service === 'gmail') {
    // Similarly for gmail
  }

  res.json({ message: `Tokens for ${service} revoked successfully` });
});

// Revoke all tokens
app.delete('/api/auth/revoke', (req, res) => {
  tokenStore.removeTokens('calendar');
  tokenStore.removeTokens('gmail');
  res.json({ message: 'All tokens revoked successfully' });
});

// OAuth initiation endpoints (for installed apps flow)
app.get('/api/auth/google', (req, res) => {
  const { GOOGLE_CLIENT_ID } = process.env;
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }

  // For installed applications, we show a URL the user should visit
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=urn:ietf:wg:oauth:2.0:oob&` +
    `response_type=code&` +
    `scope=https://www.googleapis.com/auth/calendar.readonly%20https://www.googleapis.com/auth/gmail.readonly&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.json({
    authUrl,
    instructions: 'Visit the URL above, grant permissions, and copy the authorization code.'
  });
});

app.get('/api/auth/gmail', (req, res) => {
  const { GMAIL_CLIENT_ID } = process.env;
  if (!GMAIL_CLIENT_ID) {
    return res.status(500).json({ error: 'Gmail Client ID not configured' });
  }

  // For installed applications, we show a URL the user should visit
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GMAIL_CLIENT_ID}&` +
    `redirect_uri=urn:ietf:wg:oauth:2.0:oob&` +
    `response_type=code&` +
    `scope=https://www.googleapis.com/auth/gmail.readonly&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.json({
    authUrl,
    instructions: 'Visit the URL above, grant permissions, and copy the authorization code.'
  });
});

// Briefing endpoints
app.get('/api/briefing/today', async (req, res) => {
  try {
    const briefing = await briefingService.getTodayBriefing();
    res.json(briefing);
  } catch (error) {
    console.error('Error in briefing endpoint:', error);
    res.status(500).json({ error: 'Failed to generate briefing' });
  }
});

app.get('/api/briefing/historical', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // For MVP, we'll return empty array since we don't have persistence
    // In a full implementation, this would query a database
    const historical = await briefingService.getHistoricalBriefing(date);
    res.json(historical);
  } catch (error) {
    console.error('Error in historical briefing endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve historical briefing' });
  }
});

// Individual service endpoints for debugging/testing
app.get('/api/calendar/today', async (req, res) => {
  try {
    if (!calendarService.isInitialized()) {
      return res.status(503).json({ error: 'Calendar service not configured' });
    }
    const events = await calendarService.getTodayEvents();
    res.json(events);
  } catch (error) {
    console.error('Error in calendar endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.get('/api/email/today', async (req, res) => {
  try {
    if (!emailService.isInitialized()) {
      return res.status(503).json({ error: 'Gmail service not configured' });
    }
    const emails = await emailService.getTodayEmails();
    res.json(emails);
  } catch (error) {
    console.error('Error in email endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Enhanced GitHub today endpoint
app.get('/api/github/today', async (req, res) => {
  try {
    // Get issues updated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queryParams = {
      since: today.toISOString(),
      per_page: 100
    };

    const response = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      { params: queryParams }
    );

    // Filter out pull requests and enhance data
    const issues = response.data
      .filter(issue => !issue.pull_request)
      .map(issue => ({
        ...issue,
        type: 'github',
        // Calculate recency score
        hoursSinceUpdate: (new Date() - new Date(issue.updated_at)) / (1000 * 60 * 60)
      }));

    res.json(issues);
  } catch (error) {
    handleGitHubError(res, error);
  }
});

// GOOGLE OAUTH ENDPOINTS
// Initiate Google OAuth flow for Calendar
app.get('/auth/google', (req, res) => {
  const { GOOGLE_CLIENT_ID } = process.env;
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  // Store state in a signed cookie to verify later
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000 // 10 minutes
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('http://localhost:5000/auth/google/callback')}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// Handle Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const receivedState = req.cookies.google_oauth_state;

  // Verify state to prevent CSRF
  if (!state || !receivedState || state !== receivedState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth credentials not configured' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/auth/google/callback',
      grant_type: 'authorization_code'
    });

    const tokens = tokenResponse.data;

    // Fetch user profile information
    let profile = null;
    try {
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });
      profile = {
        email: profileResponse.data.email,
        name: profileResponse.data.name,
        picture: profileResponse.data.picture,
        id: profileResponse.data.id
      };
    } catch (profileError) {
      console.warn('Could not fetch Google user profile:', profileError.message);
      // Continue without profile - not critical
    }

    // Store tokens securely with profile info
    tokenStore.storeTokens('calendar', {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + (tokens.expires_in * 1000)
    }, profile);

    // Clear the state cookie
    res.clearCookie('google_oauth_state');

    // Redirect to frontend success page or show success message
    res.redirect('http://localhost:3000/auth/success?service=calendar');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Initiate Google OAuth flow for Gmail
app.get('/auth/gmail', (req, res) => {
  const { GMAIL_CLIENT_ID } = process.env;
  if (!GMAIL_CLIENT_ID) {
    return res.status(500).json({ error: 'Gmail Client ID not configured' });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  // Store state in a signed cookie to verify later
  res.cookie('gmail_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000 // 10 minutes
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GMAIL_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('http://localhost:5000/auth/gmail/callback')}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly')}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// Handle Gmail OAuth callback
app.get('/auth/gmail/callback', async (req, res) => {
  const { code, state } = req.query;
  const receivedState = req.cookies.gmail_oauth_state;

  // Verify state to prevent CSRF
  if (!state || !receivedState || state !== receivedState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Gmail OAuth credentials not configured' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/auth/gmail/callback',
      grant_type: 'authorization_code'
    });

    const tokens = tokenResponse.data;

    // Fetch user profile information
    let profile = null;
    try {
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });
      profile = {
        email: profileResponse.data.email,
        name: profileResponse.data.name,
        picture: profileResponse.data.picture,
        id: profileResponse.data.id
      };
    } catch (profileError) {
      console.warn('Could not fetch Gmail user profile:', profileError.message);
      // Continue without profile - not critical
    }

    // Store tokens securely with profile info
    tokenStore.storeTokens('gmail', {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + (tokens.expires_in * 1000)
    }, profile);

    // Clear the state cookie
    res.clearCookie('gmail_oauth_state');

    // Redirect to frontend success page or show success message
    res.redirect('http://localhost:3000/auth/success?service=gmail');
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// SCHEDULED JOBS
// Schedule daily briefing generation at 9am
// In a production app, we might store this in a database or cache
// For MVP, we'll just log that it runs
cron.schedule('0 9 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running daily briefing generation job`);

  // In a full implementation, we would:
  // 1. Generate the briefing
  // 2. Store it in a database/cache
  // 3. Optionally send email notifications

  briefingService.getTodayBriefing().then(briefing => {
    console.log(`Generated briefing with ${briefing.length} items`);
  }).catch(err => {
    console.error('Error in scheduled briefing generation:', err);
  });
});

// Serve frontend index.html for all non-API routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

console.log(`Attempting to start server on port ${PORT}`);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Today's briefing: http://localhost:${PORT}/api/briefing/today`);
}).on('error', (err) => {
  console.error(`Failed to start server:`, err);
});