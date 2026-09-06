import { useState } from 'react';

interface StatusTabsProps {
  tasks: Array<{
    id: number;
    status: 'todo' | 'in-progress' | 'done';
  }>;
  onStatusChange: (taskId: number, status: string) => void;
}

const StatusTabs = ({ tasks, onStatusChange }: StatusTabsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  // Calculate counts for each status
  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="mb-6 flex space-x-2">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-4 py-2 text-sm font-medium 
                  ${activeTab === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  rounded-lg transition-colors`}
      >
        All ({counts.all})
      </button>
      
      <button
        onClick={() => setActiveTab('todo')}
        className={`px-4 py-2 text-sm font-medium 
                  ${activeTab === 'todo' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  rounded-lg transition-colors`}
      >
        Todo ({counts.todo})
      </button>
      
      <button
        onClick={() => setActiveTab('in-progress')}
        className={`px-4 py-2 text-sm font-medium 
                  ${activeTab === 'in-progress' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  rounded-lg transition-colors`}
      >
        In Progress ({counts['in-progress']})
      </button>
      
      <button
        onClick={() => setActiveTab('done')}
        className={`px-4 py-2 text-sm font-medium 
                  ${activeTab === 'done' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  rounded-lg transition-colors`}
      >
        Done ({counts.done})
      </button>
    </div>
  );
};

export default StatusTabs;
