/**
 * Demo data generator for testing without Google Cloud configuration
 * Provides sample data for Calendar, Gmail, and GitHub services
 */

const demoData = {
  // Generate sample calendar events for today
  generateCalendarEvents: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = [
      {
        id: 'demo_cal_1',
        title: 'Team Standup Meeting',
        description: 'Daily team synchronization meeting',
        start: new Date(today.setHours(9, 0, 0)).toISOString(),
        end: new Date(today.setHours(9, 30, 0)).toISOString(),
        location: 'Conference Room A',
        attendees: [
          { email: 'alice@example.com', displayName: 'Alice Smith' },
          { email: 'bob@example.com', displayName: 'Bob Johnson' }
        ],
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/event?eid=demo1',
        type: 'calendar'
      },
      {
        id: 'demo_cal_2',
        title: 'Project Review',
        description: 'Review project Q3 milestones and deliverables',
        start: new Date(today.setHours(14, 0, 0)).toISOString(),
        end: new Date(today.setHours(15, 0, 0)).toISOString(),
        location: 'Zoom Meeting',
        attendees: [
          { email: 'manager@example.com', displayName: 'Project Manager' },
          { email: 'dev@example.com', displayName: 'Developer' }
        ],
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/event?eid=demo2',
        type: 'calendar'
      },
      {
        id: 'demo_cal_3',
        title: 'Lunch with Sarah',
        description: 'Catch up over lunch',
        start: new Date(today.setHours(12, 0, 0)).toISOString(),
        end: new Date(today.setHours(13, 0, 0)).toISOString(),
        location: 'Downtown Cafe',
        attendees: [
          { email: 'sarah@example.com', displayName: 'Sarah Wilson' }
        ],
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/event?eid=demo3',
        type: 'calendar'
      }
    ];

    return events;
  },

  // Generate sample emails for today
  generateEmails: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emails = [
      {
        id: 'demo_email_1',
        title: 'Weekly Newsletter - Tech Updates',
        subject: 'Weekly Newsletter: Latest in AI and Cloud Computing',
        snippet: 'This week\\'s newsletter covers breakthrough developments in large language models and cloud infrastructure.',
        from: 'newsletter@techinsights.com',
        date: new Date(today.setHours(8, 15, 0)).toISOString(),
        importanceLabels: ['IMPORTANT', 'CATEGORY_PERSONAL'],
        type: 'email',
        gmailLink: 'https://mail.google.com/mail/u/0/#inbox/demo1'
      },
      {
        id: 'demo_email_2',
        title: 'Action Required: Budget Approval',
        subject': 'ACTION REQUIRED: Please review and approve Q3 budget by EOD',
        snippet: 'Hi Team,\\nPlease review the attached Q3 budget proposal and provide your approval by end of day today...',
        from: 'finance@company.com',
        date: new Date(today.setHours(9, 30, 0)).toISOString(),
        importanceLabels: ['IMPORTANT'],
        snippet: 'Hi Team,\\nPlease review the attached Q3 budget proposal and provide your approval by end of day today.',
        type: 'email',
        gmailLink: 'https://mail.google.com/mail/u/0/#inbox/demo2'
      },
      {
        id: 'demo_email_3',
        title: 'GitHub: Pull Request #1234 Ready for Review',
        subject': ' [acme/web-app] Pull request #1234: Add user authentication',
        snippet: 'New pull request by @devuser: Add user authentication with JWT and refresh token support',
        from: 'github@github.com',
        date: new Date(today.setHours(10, 0, 0)).toISOString(),
        importanceLabels: [],
        snippet: 'New pull request by @devuser: Add user authentication with JWT and refresh token support',
        type: 'email',
        gmailLink: 'https://mail.google.com/mail/u/0/#inbox/demo3'
      }
    ];

    return emails;
  },

  // Generate sample GitHub issues
  generateGitHubIssues: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const issues = [
      {
        id: 'demo_gh_1',
        title: 'Add dark mode toggle to dashboard',
        body: 'Implement a dark/light mode toggle switch in the header with persistence to localStorage',
        labels: [
          { name: 'enhancement', color: 'a2eeef' },
          { name: 'frontend', color: 'fbca04' },
          { name: 'help-wanted', color: '008672' }
        ],
        createdAt: new Date(today.setHours(yesterday.getDate(), 10, 30, 0)).toISOString(),
        updatedAt: new Date(today.setHours(today.getHours(), 15, 0, 0)).toISOString(),
        htmlUrl: 'https://github.com/user/repo/issues/1',
        type: 'github'
      },
      {
        id: 'demo_gh_2',
        title: 'Fix timestamp formatting in briefing',
        body: 'The time display in timeline cards shows incorrect timezone for events spanning midnight',
        labels: [
          { name: 'bug', color: 'd73a4a' },
          { name: 'backend', color: 'b60205' }
        ],
        createdAt: new Date(today.setHours(yesterday.getDate(), 14, 15, 0)).toISOString(),
        updatedAt: new Date(today.setHours(today.getHours(), 9, 0, 0)).toISOString(),
        htmlUrl: 'https://github.com/user/repo/issues/2',
        type: 'github'
      },
      {
        id: 'demo_gh_3',
        title: 'Document API authentication flow',
        body: 'Create clear documentation for the OAuth2 flow and token refresh process',
        labels: [
          { name: 'documentation', color: '0075ca' },
          { name: 'api', color: '0e8a16' }
        ],
        createdAt: new Date(today.setHours(yesterday.getDate(), 16, 45, 0)).toISOString(),
        updatedAt: new Date(today.setHours(today.getHours(), 11, 30, 0)).toISOString(),
        htmlUrl: 'https://github.com/user/repo/issues/3',
        type: 'github'
      }
    ];

    return issues;
  }
};

module.exports = demoData;