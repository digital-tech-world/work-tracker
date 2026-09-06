import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import DatePicker from '../components/ui/DatePicker';
import Checkbox from '../components/ui/Checkbox';
import Select from '../components/ui/Select';
import TagSelector from '../components/ui/TagSelector';
import DailyLogForm from '../components/daily-log/DailyLogForm';
import DailyLogList from '../components/daily-log/DailyLogList';
import FilterBar from '../components/daily-log/FilterBar';

const DailyLogPage = () => {
  const queryClient = useQueryClient();
  
  // State for form visibility
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null); // date string
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // date string for viewing
  
  // Fetch all logs for date picker navigation
  const { data: logs = [], isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['daily-logs'],
    queryFn: async () => {
      const response = await fetch('/api/daily-log/list');
      if (!response.ok) throw new Error('Failed to fetch daily logs');
      return response.json();
    }
  });
  
  // Fetch specific log entries for selected date
  const { data: logData = null, isLoading: logLoading, error: logError } = useQuery({
    queryKey: ['daily-log', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await fetch(`/api/daily-log/${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch daily log');
      return response.json();
    },
    enabled: !!selectedDate
  });
  
  // Fetch areas for task linking in entries
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas');
      if (!response.ok) throw new Error('Failed to fetch areas');
      return response.json();
    }
  });
  
  // Fetch tasks for task linking in entries
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });
  
  // Fetch tags for tagging entries
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });
  
  // Log mutation (create/update)
  const { mutate: saveLog, isLoading: isSavingLog } = useMutation({
    mutationFn: async (logData: any) => {
      const method = logData.id ? 'PATCH' : 'POST';
      const url = logData.id ? `/api/daily-log/${logData.id}` : '/api/daily-log';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      
      if (!response.ok) throw new Error('Failed to save daily log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-log', selectedDate] });
      setLogFormOpen(false);
      setEditingLogId(null);
    }
  });
  
  // Entry mutation (create/update)
  const { mutate: saveEntry, isLoading: isSavingEntry } = useMutation({
    mutationFn: async (entryData: any) => {
      const method = entryData.id ? 'PATCH' : 'POST';
      const url = entryData.id ? `/api/daily-log/entries/${entryData.id}` : '/api/daily-log/entries';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });
      
      if (!response.ok) throw new Error('Failed to save daily log entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-log', selectedDate] });
      setEntryFormOpen(false);
      setEditingEntryId(null);
    }
  });
  
  // Handle form submissions
  const handleSaveLog = async (logData: any) => {
    await saveLog(logData);
  };
  
  const handleSaveEntry = async (entryData: any) => {
    await saveEntry(entryData);
  };
  
  // Handle deletions
  const handleDeleteLog = (date: string) => {
    if (window.confirm('Are you sure you want to delete this daily log?')) {
      // Would call delete mutation here
      console.log('Would delete log for date:', date);
    }
  };
  
  const handleDeleteEntry = (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      // Would call delete mutation here
      console.log('Would delete entry:', entryId);
    }
  };
  
  // Open form handlers
  const handleCreateLog = () => {
    setEditingLogId(null);
    setLogFormOpen(true);
  };
  
  const handleEditLog = (log: any) => {
    setEditingLogId(log.date);
    setLogFormOpen(true);
  };
  
  const handleCreateEntry = () => {
    setEditingEntryId(null);
    setEntryFormOpen(true);
  };
  
  const handleEditEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setEntryFormOpen(true);
  };
  
  // Date handling
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    // If no date selected, default to today
    if (!selectedDate && logs.length > 0) {
      // Try to select today's log if it exists, otherwise most recent
      const todayLog = logs.find(log => log.date === today);
      if (todayLog) {
        setSelectedDate(today);
      } else if (logs.length > 0) {
        // Sort by date descending and take the most recent
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSelectedDate(sortedLogs[0].date);
      }
    }
  }, [logs, selectedDate]);
  
  if (logsLoading) return <div className="p-6">Loading daily logs...</div>;
  if (logsError) return <div className="p-6 text-red-500">Error: {(logsError as Error).message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Log</h1>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCreateLog}
            isLoading={isSavingLog}
          >
            New Log
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedDate(today)}
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Date selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="flex space-x-3">
          <DatePicker 
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            min="2020-01-01"
            max={today}
          />
          <Button 
            variant="secondary" 
            onClick={() => setSelectedDate(today)}
            size="sm"
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Log form modal */}
      {logFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md p-6 bg-white border rounded-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{editingLogId ? 'Edit Daily Log' : 'New Daily Log'}</h2>
              <button onClick={() => setLogFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  value={editingLogId || ''}
                  onChange={(e) => {
                    // For editing, we don't allow changing the date
                    // In a real app, we might handle this differently
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                  disabled={!!editingLogId}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea 
                  rows={3}
                  placeholder="Brief summary of the day"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setLogFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  disabled={isSavingLog}
                >
                  {isSavingLog ? 'Saving...' : editingLogId ? 'Update Log' : 'Create Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Entry form modal */}
      {entryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{editingEntryId ? 'Edit Entry' : 'New Entry'}</h2>
              <button onClick={() => setEntryFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Text</label>
                  <textarea 
                    rows={4}
                    placeholder="What did you work on today?"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlight</label>
                  <div className="flex items-center">
                    <Checkbox 
                      // Would connect to form state in real implementation
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Mark as highlight
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Task (optional)</label>
                    <Select 
                      placeholder="Select task..."
                      options={[
                        { label: 'None', value: null },
                        ...tasks.map(task => ({ 
                          label: task.title, 
                          value: task.id 
                        }))]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (optional)</label>
                    <TagSelector 
                      placeholder="Select tags..."
                      options={[
                        ...tags.map(tag => ({ 
                          label: tag.name, 
                          value: tag.id 
                        }))]}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setEntryFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  disabled={isSavingEntry}
                >
                  {isSavingEntry ? 'Saving...' : editingEntryId ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Log display */}
      {selectedDate && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Daily Log for {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          
          {logLoading && !logData ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading log entries...</p>
            </div>
          ) : (
            <>
              {logError && (
                <div className="p-4 bg-red-50 text-red-500 rounded mb-4">
                  Error: {(logError as Error).message}
                </div>
              )}
              
              {/* Log summary (if exists) */}
              {logData && logData.summary && (
                <div className="mb-6 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-blue-800">{logData.summary}</p>
                </div>
              )}
              
              {/* Entry form button */}
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleCreateEntry}
                  isLoading={isSavingEntry}
                >
                  Add Entry
                </Button>
              </div>
              
              {/* Entries list */}
              <DailyLogList 
                entries={logData?.entries || []} 
                areas={areas}
                tasks={tasks}
                tags={tags}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
              
              {/* Log summary editor (if no summary exists) */}
              {!logData?.summary && (
                <div className="mt-6 p-4 bg-gray-50 rounded border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add Summary (Optional)</h3>
                  <textarea 
                    rows={3}
                    placeholder="Brief summary of the day..."
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Logs list */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Daily Logs</h2>
        <DailyLogList 
          logs={logs} 
          isLogList={true}
          onEdit={handleEditLog}
          onDelete={handleDeleteLog}
        />
      </div>
    </div>
  );
};

export default DailyLogPage;