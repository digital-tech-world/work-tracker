const { google } = require('googleapis');
const tokenStore = require('./tokenStore');
const demoData = require('./demoData');

class EmailService {
  constructor() {
    this.gmail = null;
    this.useDemoData = !(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
    // Initialize will be called dynamically when credentials are available
  }

  initializeGmail(clientId, clientSecret, refreshToken) {
    if (!clientId || !clientSecret || !refreshToken) {
      console.warn('Gmail credentials not fully configured');
      this.gmail = null;
      this.useDemoData = true;
      return false;
    }

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      // We'll set the redirect URI dynamically based on the request
      'http://localhost:5000/auth/gmail/callback' // Will be overridden per request
    );

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    this.useDemoData = false;
    return true;
  }

  isInitialized() {
    return this.gmail !== null;
  }

  async getTodayEmails() {
    if (this.useDemoData) {
      console.log('Using demo data for Gmail');
      return demoData.generateEmails();
    }

    if (!this.isInitialized()) {
      // Try to load from token store
      const tokens = tokenStore.getTokens('gmail');
      if (tokens && tokens.refresh_token) {
        const clientId = process.env.GMAIL_CLIENT_ID;
        const clientSecret = process.env.GMAIL_CLIENT_SECRET;
        if (clientId && clientSecert) {
          this.initializeGmail(clientId, clientSecret, tokens.refresh_token);
        }
      }

      if (!this.isInitialized()) {
        console.warn('Gmail service not initialized. Using demo data.');
        this.useDemoData = true;
        return demoData.generateEmails();
      }
    }

    try {
      // Search for emails from today that are in PRIMARY category or UNREAD
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const query = `after:${today.toISOString().split('T')[0]} before:${tomorrow.toISOString().split('T')[0]} (in:inbox OR is:unread OR label:important)`;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50
      });

      if (!response.data.messages || response.data.messages.length === 0) {
        return [];
      }

      // Get detailed information for each message
      const emailPromises = response.data.messages.map(msg =>
        this.getEmailDetail(msg.id)
      );

      const emails = await Promise.all(emailPromises);
      return emails.filter(email => email !== null);
    } catch (error) {
      console.error('Error fetching emails:', error);
      console.warn('Falling back to demo data for Gmail');
      this.useDemoData = true;
      return demoData.generateEmails();
    }
  }

  async getEmailDetail(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date']
      });

      const headers = response.data.payload.headers || {};

      const fromHeader = headers.find(h => h.name === 'From');
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const dateHeader = headers.find(h => h.name === 'Date');

      // Get snippet if available
      const snippet = response.data.snippet || '';

      return {
        id: response.data.id,
        threadId: response.data.threadId,
        from: fromHeader ? fromHeader.value : '',
        subject: subjectHeader ? subjectHeader.value : '(No Subject)',
        date: dateHeader ? dateHeader.value : '',
        snippet: snippet,
        isUnread: !response.data.labelIds.includes('UNREAD'),
        importance: this.calculateImportance(response.data.labelIds, fromHeader ? fromHeader.value : ''),
        type: 'email',
        gmailLink: `https://mail.google.com/mail/#inbox/${response.data.id}`
      };
    } catch (error) {
      console.error(`Error fetching email detail for ${messageId}:`, error);
      return null;
    }
  }

  calculateImportance(labelIds, sender) {
    let score = 0;

    // Important labels boost score
    if (labelIds.includes('IMPORTANT')) score += 3;
    if (labelIds.includes('STARRED')) score += 2;

    // Priority inbox labels
    if (labelIds.includes('CATEGORY_PRIMARY')) score += 2;
    if (labelIds.includes('CATEGORY_SOCIAL')) score += 0;
    if (labelIds.includes('CATEGORY_PROMOTIONS')) score -= 1;

    // Unread gets a boost
    if (!labelIds.includes('UNREAD')) score += 1;

    // Known important senders (could be made configurable)
    const importantDomains = ['@company.com', '@team.com'];
    const hasImportantDomain = importantDomains.some(domain => sender.includes(domain));
    if (hasImportantDomain) score += 2;

    return score;
  }
}

module.exports = new EmailService();