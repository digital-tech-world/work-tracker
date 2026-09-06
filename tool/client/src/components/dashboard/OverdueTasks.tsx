interface OverdueTasksProps {
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    dueDate?: number; // timestamp
    status: 'todo' | 'in-progress' | 'done';
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

const OverdueTasks = ({ tasks }: OverdueTasksProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'done';
  }).sort((a, b) => {
    // Sort by due date (earliest first)
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  if (overdueTasks.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-xl font-bold mb-4">Overdue Tasks</h2>
        <p className="text-gray-500">No overdue tasks! 🎉</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Overdue Tasks</h2>
      <div className="space-y-3">
        {overdueTasks.slice(0, 5).map(task => (
          <div key={task.id} className="border-l-4 border-red-500 pl-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full`} 
                  style={{ backgroundColor: '#EF4444' }}
                ></div>
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              </div>
              <span className="text-xs text-red-600">
                {/* Calculate days overdue */}
                {Math.floor((today.getTime() - new Date(task.dueDate || 0).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">
                {task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </div>
        ))}
        {overdueTasks.length > 5 && (
          <div className="text-center text-sm text-gray-500 mt-3">
            +{overdueTasks.length - 5} more overdue tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueTasks;
