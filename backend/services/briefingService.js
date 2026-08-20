const calendarService = require('./calendarService');
const emailService = require('./emailService');
const demoData = require('./demoData');

class BriefingService {
  constructor() {
    // GitHub data will be fetched from demo data when needed
  }

  /**
   * Calculate urgency score for an item
   * Higher score = more urgent
   */
  calculateUrgencyScore(item) {
    let score = 0;
    const now = new Date();

    switch (item.type) {
      case 'calendar':
        // Calendar urgency based on time proximity
        const startTime = new Date(item.start);
        const hoursUntil = (startTime - now) / (1000 * 60 * 60);

        if (hoursUntil <= 0) {
          // Happening now or overdue
          score += 10;
        } else if (hoursUntil <= 1) {
          // Within next hour
          score += 8;
        } else if (hoursUntil <= 3) {
          // Within next 3 hours
          score += 6;
        } else if (hoursUntil <= 12) {
          // Within next 12 hours
          score += 4;
        } else if (hoursUntil <= 24) {
          // Within next day
          score += 2;
        }
        break;

      case 'email':
        // Email urgency based on importance and recency
        score += item.importance || 0;

        // Boost for very recent emails (last hour)
        const emailTime = new Date(item.date);
        const hoursSinceEmail = (now - emailTime) / (1000 * 60 * 60);
        if (hoursSinceEmail <= 1) {
          score += 3;
        } else if (hoursSinceEmail <= 4) {
          score += 2;
        }
        break;

      case 'github':
        // GitHub urgency - we'll enhance this once we modify the GitHub service
        // For now, basic scoring based on labels and update time
        if (item.labels && item.labels.some(label =>
          ['urgent', 'high-priority', 'blocker'].includes(label.toLowerCase()))) {
          score += 5;
        }

        // Boost for recently updated items
        const updatedTime = new Date(item.updated_at || item.updated);
        const hoursSinceUpdate = (now - updatedTime) / (1000 * 60 * 60);
        if (hoursSinceUpdate <= 1) {
          score += 3;
        } else if (hoursSinceUpdate <= 4) {
          score += 2;
        } else if (hoursSinceUpdate <= 24) {
          score += 1;
        }
        break;
    }

    return score;
  }

  /**
   * Get today's prioritized briefing from all services
   */
  async getTodayBriefing() {
    try {
      // Fetch data from all services
      const [calendarItems, emailItems, githubItems] = await Promise.all([
        this.fetchCalendarItems(),
        this.fetchEmailItems(),
        this.fetchGitHubItems()
      ]);

      // Combine all items
      const allItems = [...calendarItems, ...emailItems, ...githubItems];

      // Calculate urgency scores and sort
      const scoredItems = allItems.map(item => ({
        ...item,
        urgencyScore: this.calculateUrgencyScore(item)
      }));

      // Sort by urgency score (descending) - most urgent first
      scoredItems.sort((a, b) => b.urgencyScore - a.urgencyScore);

      return scoredItems;
    } catch (error) {
      console.error('Error generating briefing:', error);
      // Return empty array on error to prevent breaking the frontend
      return [];
    }
  }

  async fetchCalendarItems() {
    try {
      if (!calendarService.isInitialized()) {
        return [];
      }
      return await calendarService.getTodayEvents();
    } catch (error) {
      console.warn('Calendar service error:', error.message);
      return [];
    }
  }

  async fetchEmailItems() {
    try {
      if (!emailService.isInitialized()) {
        return [];
      }
      return await emailService.getTodayEmails();
    } catch (error) {
      console.warn('Email service error:', error.message);
      return [];
    }
  }

  async fetchGitHubItems() {
    try {
      // Use demo data for GitHub when not configured or on error
      if (!process.env.GITHUB_PAT || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
        console.log('Using demo data for GitHub');
        return demoData.generateGitHubIssues();
      }

      // Try to fetch from GitHub API
      const githubApi = require('axios').create({
        baseURL: 'https://api.github.com',
        headers: {
          Authorization: `token ${process.env.GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const queryParams = {
        since: today.toISOString(),
        per_page: 100
      };

      const response = await githubApi.get(
        `/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/issues`,
        { params: queryParams }
      );

      // Filter out pull requests and enhance data
      const issues = response.data
        .filter(issue => !issue.pull_request)
        .map(issue => ({
          ...issue,
          type: 'github'
        }));

      return issues;
    } catch (error) {
      console.warn('GitHub service error:', error.message);
      console.warn('Falling back to demo data for GitHub');
      return demoData.generateGitHubIssues();
    }
  }

  /**
   * Get historical briefing for a specific date
   * Note: This would require storing briefings in a database for true historical data
   * For MVP, we'll return today's briefing or empty array
   */
  async getHistoricalBriefing(dateString) {
    // For MVP, we don't have persistence yet
    // In a full implementation, this would query a database
    console.log(`Historical briefing requested for ${dateString} - not implemented in MVP`);
    return [];
  }
}

module.exports = new BriefingService();