interface TasksByAreaProps {
  tasks: Array<{
    id: number;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    areaId?: number;
  }>;
  areas: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

const TasksByArea = ({ tasks, areas }: TasksByAreaProps) => {
  // Group tasks by area
  const tasksByArea: Record<number, Array<any>> = {};
  tasks.forEach(task => {
    const areaId = task.areaId || 0; // 0 for no area
    if (!tasksByArea[areaId]) {
      tasksByArea[areaId] = [];
    }
    tasksByArea[areaId].push(task);
  });
  
  // Calculate stats for each area
  const areaStats = areas.map(area => {
    const areaTasks = tasksByArea[area.id] || [];
    const total = areaTasks.length;
    const todo = areaTasks.filter(t => t.status === 'todo').length;
    const inProgress = areaTasks.filter(t => t.status === 'in-progress').length;
    const done = areaTasks.filter(t => t.status === 'done').length;
    
    return {
      ...area,
      total,
      todo,
      inProgress,
      done
    };
  });
  
  if (areaStats.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-xl font-bold mb-4">Tasks by Area</h2>
        <p className="text-gray-500">No areas or tasks found.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Tasks by Area</h2>
      <div className="space-y-4">
        {areaStats.map(area => (
          <div key={area.id} className="border-l-4 border-primary-500 pl-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full`} 
                  style={{ backgroundColor: area.color }}
                ></div>
                <h3 className="text-lg font-medium text-gray-900">{area.name}</h3>
              </div>
              <div className="text-sm text-gray-500">
                {area.todo} todo • {area.inProgress} in progress • {area.done} done
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: area.total > 0 ? (area.done / area.total) * 100 : 0 }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">{area.total} total tasks</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksByArea;
