interface DailyLogEntry {
  id: number;
  text: string;
  isHighlight: boolean;
  taskId?: number;
  createdAt: number;
}

interface DailyLog {
  id: number;
  date: string; // YYYY-MM-DD
  summary?: string;
  createdAt: number;
  updatedAt: number;
  entries: DailyLogEntry[];
}

interface DailyLogListProps {
  logs: DailyLog[];
  isLogList?: boolean;
  entries?: DailyLogEntry[];
  areas: Array<{id: number; name: string; color: string}>;
  tasks: Array<{id: number; title: string; areaId?: number}>;
  tags: Array<{id: number; name: string}>;
  onEdit: (log: DailyLog | DailyLogEntry) => void;
  onDelete: (id: number | string) => void; // string for date when deleting log
}

const DailyLogList = ({ 
  logs = [], 
  isLogList = false, 
  entries = [], 
  areas, 
  tasks, 
  tags, 
  onEdit, 
  onDelete 
}: DailyLogListProps) => {
  // Helper to get area name
  const getAreaName = (areaId: number | undefined) => {
    if (!areaId) return null;
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : null;
  };
  
  // Helper to get task title
  const getTaskTitle = (taskId: number | undefined) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : null;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLogList) {
    // Display list of logs
    if (logs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No daily logs found. Create your first log!</p>
        </div>
      );
    }
    
    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return (
      <div className="space-y-4">
        {sortedLogs.map(log => (
          <div key={log.id} className="border-l-4 border-gray-300 pl-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full`} 
                  style={{ backgroundColor: '#6B7280' }}
                ></div>
                <h3 className="text-lg font-medium text-gray-900">
                  {formatDate(log.date)}
                </h3>
              </div>
              <div className="flex space-x-2 text-sm">
                <button
                  onClick={() => onEdit(log)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  onClick={() => onDelete(log.date)}
                  className="p-1 rounded hover:bg-gray-200 text-red-600 hover:text-red-900"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
            {log.summary && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{log.summary}</p>
            )}
            <div className="text-xs text-gray-500">
              {log.entries.length} entries • 
              {log.entries.filter(e => e.isHighlight).length} highlights
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    // Display entries for a specific log
    if (entries.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No entries for this date yet. Add your first entry!</p>
        </div>
      );
    }
    
    // Sort entries by creation time (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      b.createdAt - a.createdAt
    );
    
    return (
      <div className="space-y-3">
        {sortedEntries.map(entry => (
          <div key={entry.id} className="border-l-4 pl-3" 
               style={{ borderLeftColor: entry.isHighlight ? '#EF4444' : '#6B7280' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full`} 
                  style={{ 
                    backgroundColor: entry.isHighlight ? '#EF4444' : '#6B7280',
                    opacity: entry.isHighlight ? 0.8 : 0.6
                  }}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{entry.text}</p>
                  {entry.taskId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Related task: {getTaskTitle(entry.taskId) || `Task #${entry.taskId}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {entry.isHighlight && (
                    <span className="text-red-600 font-medium">★ Highlight</span>
                  )}
                  <span className="text-gray-500">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.taskId && (
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-800">
                    Task
                  </span>
                )}
                {/* Tags would be displayed here in a real implementation */}
              </div>
              
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(entry)}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default DailyLogList;
