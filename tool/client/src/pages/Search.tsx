import { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<Array<{
    id: number;
    title: string;
    content: string;
    type: 'task' | 'bookmark' | 'note';
    areaId?: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'bookmarks' | 'notes'>('all');
  
  // Simulate Ctrl+K shortcut focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) throw new Error('Failed to perform search');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError('Search failed. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedQuery]);
  
  // Filter results by active tab
  const filteredResults = results.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });
  
  // Result type icons and colors
  const getResultConfig = (type: string) => {
    switch (type) {
      case 'task': return { icon: 'list-task', color: '#3B82F6' };
      case 'bookmark': return { icon: 'bookmark', color: '#10B981' };
      case 'note': return { icon: 'note', color: '#8B5CF6' };
      default: return { icon: 'description', color: '#6B7280' };
    }
  };
  
  if (loading && results.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Searching...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Search</h1>
      </div>
      
      {/* Search Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search (Ctrl+K to focus)
        </label>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, bookmarks, notes..."
            className="block w-full pl-10 pr-4 py-2 text-base border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-icons">search</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Search across tasks, bookmarks, and notes using full-text search
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium 
                    ${activeTab === 'all' 
                      ? 'border-b-2 border-primary-500 text-primary-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
        >
          All ({results.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-medium 
                    ${activeTab === 'tasks' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
        >
          Tasks ({results.filter(r => r.type === 'task').length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 text-sm font-medium 
                    ${activeTab === 'bookmarks' 
                      ? 'border-b-2 border-green-500 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
        >
          Bookmarks ({results.filter(r => r.type === 'bookmark').length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-sm font-medium 
                    ${activeTab === 'notes' 
                      ? 'border-b-2 border-purple-500 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
        >
          Notes ({results.filter(r => r.type === 'note').length})
        </button>
      </div>
      
      {/* Results */}
      <div className="space-y-4">
        {filteredResults.length === 0 && !loading && debouncedQuery.trim() !== '' && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{debouncedQuery}"</p>
          </div>
        )}
        
        {filteredResults.map(result => {
          const { icon, color } = getResultConfig(result.type);
          return (
            <div key={result.id} className="border-l-4 pl-3" 
                 style={{ borderLeftColor: color }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full`} 
                    style={{ backgroundColor: color }}
                  ></div>
                  <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  {result.areaId ? ` • Area ${result.areaId}` : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{result.content}</p>
            </div>
          );
        })}
        
        {filteredResults.length > 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {filteredResults.length} of {results.length} results
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
