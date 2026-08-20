# Life Dashboard Architecture

## Overview
The Life Dashboard is a full-stack application that consolidates Google Calendar, Gmail, and GitHub data into a single daily briefing. It consists of a Node.js/Express backend and a React frontend.

## Backend (Node.js/Express)
- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Key Features**:
  - RESTful API endpoints for calendar, email, and GitHub data
  - OAuth2 authentication flow for Google services
  - Token encryption and secure storage (in HTTP-only cookies)
  - Scheduled jobs (via node-cron) for daily briefing generation
  - CORS middleware for frontend communication
  - Environment variable configuration for secrets

### API Endpoints
- `GET /api/health` - Service health check
- `GET /api/auth/status` - Authentication status for all services
- `GET /auth/google` - Initiate Google Calendar OAuth flow
- `GET /auth/gmail` - Initiate Google Gmail OAuth flow
- `GET /api/briefing/today` - Get today's prioritized briefing
- `GET /api/briefing/historical` - Get historical briefing (by date)
- `GET /api/calendar/today` - Get today's calendar events
- `GET /api/email/today` - Get today's emails
- `GET /api/github/today` - Get today's GitHub items
- `GET /api/issues` - Get GitHub issues (with filtering)
- `POST /api/issues` - Create a new GitHub issue
- `PATCH /api/issues/:number` - Update a GitHub issue
- `DELETE /api/issues/:number` - Close a GitHub issue
- `GET /api/documents` - Get list of documents in GitHub repo
- `POST /api/documents` - Add/update a document in GitHub repo
- `DELETE /api/documents/:filename` - Delete a document from GitHub repo
- `GET /api/links` - Get list of links in GitHub repo
- `POST /api/links` - Add/update a link in GitHub repo
- `DELETE /api/links/:filename` - Delete a link from GitHub repo

## Frontend (React)
- **Language**: JavaScript (React)
- **Framework**: Create React App
- **Key Features**:
  - Router for navigation between today's briefing and historical data
  - Timeline view grouped by time of day (morning, afternoon, evening)
  - Color-coded urgency indicators (high, medium, low)
  - Service type icons (Calendar, Email, GitHub)
  - Direct links to original items in each service
  - Authentication prompts for missing credentials
  - Responsive design

### Components
- `App.js` - Main application component with routing and auth checking
- `BriefingTimeline.js` - Displays today's briefing in timeline format
- `HistoricalTab.js` - Displays historical briefings (placeholder for MVP)
- `AuthPrompt.js` - Prompts user to connect missing services
- `services/api.js` - Axios instance for API calls
- `utils/dateHelpers.js` - Date formatting utilities

## Data Flow
1. User visits the application (http://localhost:3000)
2. Frontend checks authentication status via `/api/auth/status`
3. If any service is not authenticated, AuthPrompt is shown
4. User completes OAuth flows for Google services (Calendar and Gmail)
5. GitHub token is configured via environment variables
6. Frontend fetches today's briefing via `/api/briefing/today`
7. Backend aggregates data from calendar, email, and GitHub services
8. Data is scored by urgency and sorted (urgent → low)
9. Frontend displays briefing in timeline view grouped by time of day
10. User can click items to view originals in respective services
11. Historical data is available via separate tab (MVP: empty array)

## Security
- **Encrypted Token Storage**: Google OAuth tokens are encrypted before storage in cookies
- **CSRF Protection**: State parameters in OAuth flow prevent cross-site request forgery
- **HTTP-only Cookies**: OAuth state tokens stored in secure, HTTP-only cookies
- **Environment Variables**: Secrets (API keys, tokens) kept out of source code
- **Read-Only Access**: Applications only read user data - never modify, delete, or share
- **No Server Storage**: Tokens stored only in browser cookies - nothing stored on servers
- **Automatic Refresh**: Tokens renewed automatically in the background using refresh tokens
- **Input Validation**: API endpoint validation and sanitization

## Deployment
### Development
1. Backend: `npm start` (runs on http://localhost:5000)
2. Frontend: `npm start` (runs on http://localhost:3000)
3. Complete OAuth flows when prompted

### Production
1. Build frontend: `cd frontend && npm run build`
2. Serve build via backend (see backend/index.js for static serving configuration)
3. Set environment variables for production
4. Start backend: `npm start`
5. Access application at http://localhost:5000 (or configured port)

## Dependencies
### Backend
- express: Web framework
- axios: HTTP client for API requests
- cors: Middleware for enabling CORS
- cookie-parser: Middleware for parsing cookies
- dotenv: Environment variable loading
- crypto: Built-in Node.js module for cryptography
- node-cron: Job scheduling
- googleapis: Google API client library
- google-auth-library: Google OAuth2 authentication

### Frontend
- react: UI library
- react-dom: React DOM bindings
- react-router-dom: Routing for single-page application
- date-fns: Date formatting and manipulation
- axios: HTTP client for API calls

## Development Scripts
- `./setup.sh` - Install dependencies for both backend and frontend
- `./start.sh` - Start both backend and frontend servers
- `./verify.sh` - Check system health and status
- `./install.sh` - Detailed setup and usage instructions

## Design Decisions
1. **Separate Services**: Backend and frontend are separate during development for ease of debugging and hot reloading.
2. **Token Storage**: Tokens are stored in encrypted HTTP-only cookies to prevent XSS attacks and ensure they are sent with requests.
3. **OAuth Flow**: Uses Google's OAuth 2.0 for Web Applications flow with manual code entry (out-of-band) for simplicity.
4. **Urgency Scoring**: Simple scoring algorithm based on time proximity (calendar), importance labels (email), and GitHub labels.
5. **Timeline View**: Organizes items into morning (6AM-12PM), afternoon (12PM-5PM), and evening (5PM-10PM) for easy daily planning.