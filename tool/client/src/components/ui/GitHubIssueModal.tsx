import { useState, useEffect } from 'react';

interface GitHubIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkIssue: (issueData: {title: string; url: string; number: number}) => void;
}

const GitHubIssueModal = ({ isOpen, onClose, onLinkIssue }: GitHubIssueModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<Array<{title: string; url: string; number: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  // In a real app, this would fetch from GitHub API using a token
  // For demo, we'll simulate with mock data
  useEffect(() => {
    if (!searchQuery.trim() || !selectedRepo) return;
    
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock GitHub issues data
        const mockIssues = [
          { 
            title: `Fix login authentication bug`, 
            url: `https://github.com/${selectedRepo}/issues/1`, 
            number: 1 
          },
          { 
            title: `Add user profile page`, 
            url: `https://github.com/${selectedRepo}/issues/2`, 
            number: 2 
          },
          { 
            title: `Improve dashboard performance`, 
            url: `https://github.com/${selectedRepo}/issues/3`, 
            number: 3 
          },
          { 
            title: `Update documentation for API v2`, 
            url: `https://github.com/${selectedRepo}/issues/4`, 
            number: 4 
          }
        ];
        
        // Filter based on search query
        const filteredIssues = mockIssues.filter(issue => 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setIssues(filteredIssues);
      } catch (err) {
        setError('Failed to fetch issues from GitHub');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, [searchQuery, selectedRepo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Link GitHub Issue</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository</label>
            <input
              type="text"
              placeholder="username/repo"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Issues</label>
            <input
              type="text"
              placeholder="Search for issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            />
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-4">
              <span className="mr-2 h-4 w-4 animate-spin"><span className="material-icons">loading</span></span>
              Searching...
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-500 rounded mb-4">
              {error}
            </div>
          )}
          
          {!loading && !error && issues.length > 0 && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
              <div className="divide-y divide-gray-200">
                {issues.map(issue => (
                  <div key={issue.number} className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                        <p className="text-xs text-gray-500">
                          #{issue.number} · <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View on GitHub</a>
                        </p>
                      </div>
                      <button
                        onClick={() => onLinkIssue(issue)}
                        className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!loading && !error && issues.length === 0 && selectedRepo && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              No issues found matching "{searchQuery}" in {selectedRepo}
            </div>
          )}
          
          {!loading && !error && !selectedRepo && (
            <div className="text-center py-8 text-gray-500">
              Please enter a GitHub repository to search for issues
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default GitHubIssueModal;
