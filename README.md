# Life Dashboard

A personal productivity dashboard that consolidates your calendar, emails, and GitHub projects into a single daily briefing.

## Features

- 📅 **Google Calendar Integration** - View today's events and meetings with secure OAuth2 flow
- 📧 **Gmail Integration** - See important and unread emails from today with secure OAuth2 flow
- 💻 **GitHub Integration** - Track your assigned issues, pull requests, and notes via Personal Access Token
- ⏰ **Daily Briefing at 9AM** - Automatically generated prioritized summary
- 📊 **Urgency-Based Sorting** - Items ordered from urgent to low priority
- 🃏 **Timeline/Card View** - Visual representation of your day (morning/afternoon/evening)
- 🔗 **Direct Links** - One-click access to original items in each service
- 📚 **Historical Data** - View past briefings in a separate tab
- 🔐 **Secure Authentication** - OAuth2 flows for Google services, PAT for GitHub with encrypted token storage

## How It Works

### Google Services (Calendar & Gmail)
1. Click "Connect" button for each service
2. You'll be redirected to Google's secure authentication page
3. Grant permission for Life Dashboard to view your calendar/email (read-only access)
4. You'll be automatically redirected back to the application
5. Your tokens are securely stored and automatically refreshed
6. Your data appears in your personalized daily briefing

### GitHub
1. Configure your Personal Access Token in the backend/.env file
2. The application uses this token to access your GitHub data

## Security Features

- **Encrypted Token Storage**: Google OAuth tokens are encrypted before storage
- **CSRF Protection**: State parameters prevent cross-site request forgery
- **HTTP-only Cookies**: OAuth state tokens stored in secure cookies
- **Environment Variables**: Secrets kept out of source code
- **Read-Only Access**: We only read your data - never modify, delete, or share
- **No Server Storage**: Tokens stored only in your browser's cookies (encrypted)
- **Automatic Refresh**: Tokens renewed automatically in the background

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory with:

```env
# GitHub Configuration (required)
GITHUB_PAT=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username_or_org
GITHUB_REPO_NAME=your_github_repository_name

# Google Services (will be configured via OAuth flow)
# You don't need to fill these in initially - they're handled via the connection flow
GOOGLE_CLIENT_ID=your_google_client_id_from_google_cloud_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_google_cloud_console
GMAIL_CLIENT_ID=your_google_client_id_from_google_cloud_console
GMAIL_CLIENT_SECRET=your_google_client_secret_from_google_cloud_console

# Security (optional - will be auto-generated if not provided)
COOKIE_SECRET=your_random_string_for_cookie_signing
TOKEN_ENCRYPTION_KEY=your_random_string_for_token_encryption

# Server Configuration (optional)
PORT=5000
```

### 4. Get Credentials

**GitHub:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope (for full access) or `repo:status` + `public_repo` (for public repos only)
3. Copy the generated token

**Google Services:**
No initial setup needed! The OAuth flow will guide you through:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Calendar API" and "Gmail API"
4. Create OAuth 2.0 Client IDs (Web Application type)
5. Set Authorized redirect URIs to:
   - `http://localhost:5000/auth/google/callback`
   - `http://localhost:5000/auth/gmail/callback`
6. Copy the Client ID and Secret to your backend/.env file (or leave blank to be prompted)

### 5. Initial Authentication
1. Start both servers:
   ```bash
   # In backend directory
   npm start
   
   # In frontend directory  
   npm start
   ```
2. Visit http://localhost:3000
3. Click "Connect Google Calendar" and "Connect Gmail" buttons
4. Complete the Google OAuth flows when prompted
5. Your GitHub token should already be configured in the .env file

### 6. Daily Briefing
The system automatically generates a briefing every day at 9AM server time.
You can also manually refresh the briefing at any time.

## API Endpoints

### Health & Status
- `GET /api/health` - Service health check
- `GET /api/auth/status` - Authentication status for all services (including token validity)

### Authentication
- `GET /auth/google` - Initiate Google Calendar OAuth flow
- `GET /auth/gmail` - Initiate Google Gmail OAuth flow
- `GET /auth/google/callback` - Google Calendar OAuth callback (handled automatically)
- `GET /auth/gmail/callback` - Google Gmail OAuth callback (handled automatically)
- `DELETE /api/auth/revoke/:service` - Revoke tokens for a service (calendar/gmail)
- `DELETE /api/auth/revoke` - Revoke all tokens

### Briefing
- `GET /api/briefing/today` - Get today's prioritized briefing
- `GET /api/briefing/historical?date=YYYY-MM-DD` - Get historical briefing
- `GET /api/calendar/today` - Get today's calendar events
- `GET /api/email/today` - Get today's emails
- `GET /api/github/today` - Get today's GitHub items

## Features in Detail

### Prioritization Algorithm
Items are scored based on urgency:
- **Calendar Events**: Score based on time proximity (sooner = higher score)
- **Emails**: Score based on importance labels, recency, and sender domains
- **GitHub Items**: Score based on labels (urgent, high-priority) and update recency

### Timeline View
The briefing is organized into three time periods:
- **Morning** (6 AM - 12 PM)
- **Afternoon** (12 PM - 5 PM) 
- **Evening** (5 PM - 10 PM)

Each item appears as a card showing:
- Service type icon (📅 Calendar, 📧 Email, 💻 GitHub)
- Title/subject
- Time/relevance indicator
- Priority level (color-coded)
- Location/sender info (when available)
- Direct action links to view in original service

## Development

### Available Scripts

In the backend directory:
- `npm start` - Start the server
- `npm test` - Run tests (placeholder)

In the frontend directory:
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file prevents accidental commits of sensitive data
- Google OAuth tokens are encrypted in cookies using AES-256-GCM
- Token storage is browser-only (cookies) - nothing stored on our servers
- For production deployment, consider using a secure secrets manager
- Refresh tokens should have reasonable expiration and rotation policies

## Troubleshooting

### Backend Not Starting
- Ensure all dependencies are installed: `npm install`
- Check that required environment variables are set
- Verify port 5000 is available

### Frontend Not Loading
- Wait for initial compilation to complete (may take 1-2 minutes)
- Check browser console for errors
- Ensure backend is running on http://localhost:5000

### Authentication Issues
- Verify Google Cloud Console OAuth consent screen is configured
- Check that redirect URIs match exactly: `http://localhost:5000/auth/google/callback` and `http://localhost:5000/auth/gmail/callback`
- Ensure API keys have correct permissions/scopes
- Clear browser cookies and try again if experiencing issues

### No Data Showing
- Verify service credentials are correct
- Check that you have calendar events/emails/GH items for today
- Look at backend logs for API error messages
- Verify token validity via `/api/auth/status` endpoint

---

**Your Life Dashboard is ready!** Configure your credentials, start the servers, and begin enjoying a consolidated view of your daily commitments across calendar, email, and GitHub.

*Built with ❤️ using Node.js, Express, React, and Google/GitHub APIs with secure OAuth2 flows*