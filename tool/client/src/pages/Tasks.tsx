import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';
import Checkbox from '../components/ui/Checkbox';
import TagSelector from '../components/ui/TagSelector';
import GitHubIssueModal from '../components/ui/GitHubIssueModal';
import AIAutoCategorizeButton from '../components/ui/AIAutoCategorizeButton';
import TaskForm from '../components/tasks/TaskForm';
import TaskTable from '../components/tasks/TaskTable';
import FilterBar from '../components/tasks/FilterBar';
import StatusTabs from '../components/tasks/StatusTabs';

const TasksPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: taskIdParam } = useParams<{ id: string }>();
  
  // State for modal/form visibility
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [githubIssueModalOpen, setGitHubIssueModalOpen] = useState(false);
  
  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });
  
  // Fetch areas for dropdown/filter
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas');
      if (!response.ok) throw new Error('Failed to fetch areas');
      return response.json();
    }
  });
  
  // Fetch tags for filter
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });
  
  // Task mutation (create/update)
  const { mutate: saveTask, isLoading: isSaving } = useMutation({
    mutationFn: async (taskData: any) => {
      const method = taskData.id ? 'PATCH' : 'POST';
      const url = taskData.id ? `/api/tasks/${taskData.id}` : '/api/tasks';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) throw new Error('Failed to save task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskFormOpen(false);
      setEditingTaskId(null);
    }
  });
  
  // Task deletion mutation
  const { mutate: deleteTask, isLoading: isDeleting } = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
  
  // Task status update mutation
  const { mutate: updateTaskStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedAt: new Date().getTime() })
      });
      if (!response.ok) throw new Error('Failed to update task status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
  
  // Handle form submission
  const handleSaveTask = async (taskData: any) => {
    await saveTask(taskData);
  };
  
  // Handle task deletion
  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };
  
  // Handle status change
  const handleStatusChange = (taskId: number, status: string) => {
    updateTaskStatus({ taskId, status });
  };
  
  // Open task form for creating new task
  const handleCreateTask = () => {
    setEditingTaskId(null);
    setTaskFormOpen(true);
  };
  
  // Open task form for editing existing task
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setTaskFormOpen(true);
  };
  
  // Open GitHub issue modal
  const handleOpenGitHubModal = () => {
    setGitHubIssueModalOpen(true);
  };
  
  // Close GitHub issue modal
  const handleCloseGitHubModal = () => {
    setGitHubIssueModalOpen(false);
  };
  
  // Handle linking GitHub issue (simplified)
  const handleLinkGitHubIssue = (issueData: any) => {
    // In a real implementation, this would create/update the task with GitHub data
    handleCloseGitHubModal();
    // For now, just show an alert
    alert(`Linked GitHub issue: ${issueData.title}`);
  };
  
  // If navigating to a specific task ID, open edit form
  // useEffect(() => {
  //   if (taskIdParam) {
  //     const task = tasks.find(t => t.id === parseInt(taskIdParam));
  //     if (task) {
  //       handleEditTask(task);
  //     }
  //   }
  // }, [taskIdParam, tasks, handleEditTask]);
  
  if (isLoading) return <div className="col-span-3 p-6">Loading tasks...</div>;
  if (error) return <div className="col-span-3 p-6 text-red-500">Error: {(error as Error).message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleCreateTask}
              isLoading={isSaving}
            >
              New Task
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleOpenGitHubModal}
            >
              GitHub Issue
            </Button>
            <AIAutoCategorizeButton 
              onCategorize={async (taskData: any) => {
                // In real app, this would call AI service and return suggested values
                // For demo, we'll just populate form with mock suggestions
                setTaskFormOpen(true);
                setEditingTaskId(null);
                // Mock AI suggestions - in reality would come from API call
                const suggestedData = {
                  ...taskData,
                  areaId: 1, // Development area
                  priority: 'high',
                  tags: ['frontend', 'ui']
                };
                // Would normally populate form here
                console.log('AI suggested:', suggestedData);
              }}
            >
              AI Auto-Categorize
            </AIAutoCategorizeButton>
          </div>
        </div>
        
        {/* Task counts badge */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Total: {tasks.length}</span>
          <span>Todo: {tasks.filter(t => t.status === 'todo').length}</span>
          <span>In Progress: {tasks.filter(t => t.status === 'in-progress').length}</span>
          <span>Done: {tasks.filter(t => t.status === 'done').length}</span>
        </div>
      </div>
      
      {/* Filter bar */}
      <FilterBar 
        areas={areas} 
        tags={tags}
      />
      
      {/* Status tabs */}
      <StatusTabs 
        tasks={tasks} 
        onStatusChange={handleStatusChange}
      />
      
      {/* Task table */}
      <TaskTable 
        tasks={tasks} 
        onEdit={handleEditTask} 
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />
      
      {/* Task form modal */}
      <TaskForm 
        taskId={editingTaskId}
        isOpen={taskFormOpen}
        areas={areas}
        tags={tags}
        onClose={() => setTaskFormOpen(false)}
        onSave={handleSaveTask}
        isSaving={isSaving}
      />
      
      {/* GitHub issue modal */}
      <GitHubIssueModal 
        isOpen={githubIssueModalOpen}
        onClose={handleCloseGitHubModal}
        onLinkIssue={handleLinkGitHubIssue}
      />
    </div>
  );
};

export default TasksPage;
