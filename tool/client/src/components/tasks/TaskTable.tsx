import { useState } from 'react';

interface TaskTableProps {
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done';
    areaId?: number;
    dueDate?: number;
    githubIssueUrl?: string;
    githubIssueNumber?: number;
    createdAt: number;
    updatedAt: number;
  }>;
  onEdit: (task: any) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, status: string) => void;
}

const TaskTable = ({ tasks, onEdit, onDelete, onStatusChange }: TaskTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Priority badge styles
  const getPriorityBadgeClass = (priority: string) => {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (priority) {
      case 'critical': return `${base} bg-red-100 text-red-800`;
      case 'high': return `${base} bg-orange-100 text-orange-800`;
      case 'medium': return `${base} bg-yellow-100 text-yellow-800`;
      case 'low': return `${base} bg-green-100 text-green-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  // Status badge styles
  const getStatusBadgeClass = (status: string) => {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (status) {
      case 'todo': return `${base} bg-blue-100 text-blue-800`;
      case 'in-progress': return `${base} bg-yellow-100 text-yellow-800`;
      case 'done': return `${base} bg-green-100 text-green-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('title')}
            >
              Title
              {sortConfig.key === 'title' && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center">
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Area
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Priority
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Due Date
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedTasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded mr-2 
                          status={task.status === 'done' ? 'bg-green-500' : 
                                  task.status === 'in-progress' ? 'bg-yellow-500' : 
                                  'bg-blue-500'}"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* In a real app, we'd fetch area name from areaId */}
                {task.areaId ? (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    Area {task.areaId}
                  </span>
                ) : (
                  <span className="text-gray-400">No Area</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getPriorityBadgeClass(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadgeClass(task.status)}>
                  {task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.dueDate ? (
                  <span>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-gray-400">No due date</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const newStatus = 
                        task.status === 'todo' ? 'in-progress' :
                        task.status === 'in-progress' ? 'done' :
                        'todo';
                      onStatusChange(task.id, newStatus);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <span className="material-icons">
                      {task.status === 'todo' ? 'play_arrow' : 
                       task.status === 'in-progress' ? 'check_circle' : 
                       'undo'}
                    </span>
                  </button>
                  
                  {task.githubIssueUrl && (
                    <a
                      href={task.githubIssueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                    >
                      <span className="material-icons">link</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 rounded hover:bg-gray-200 text-red-600 hover:text-red-900"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
