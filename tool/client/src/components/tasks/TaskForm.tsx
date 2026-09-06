import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import Checkbox from '../ui/Checkbox';
import TagSelector from '../ui/TagSelector';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  areaId: z.number().int().positive().optional().nullable(),
  dueDate: z.number().int().positive().optional().nullable(),
  githubIssueUrl: z.string().url().optional().nullable(),
  githubIssueNumber: z.number().int().positive().optional().nullable()
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  taskId: number | null;
  isOpen: boolean;
  areas: Array<{id: number; name: string; color: string}>;
  tags: Array<{id: number; name: string}>;
  onClose: () => void;
  onSave: (data: TaskFormValues) => Promise<void>;
  isSaving: boolean;
}

const TaskForm = ({ taskId, isOpen, areas, tags, onClose, onSave, isSaving }: TaskFormProps) => {
  const [githubIssueData, setGithubIssueData] = useState<{title: string; url: string; number: number} | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      areaId: null,
      dueDate: null,
      githubIssueUrl: null,
      githubIssueNumber: null
    }
  });

  const onSubmit = async (data: TaskFormValues) => {
    // If we have GitHub issue data from the modal, include it
    const taskData = {
      ...data,
      githubIssueUrl: githubIssueData?.url || data.githubIssueUrl,
      githubIssueNumber: githubIssueData?.number || data.githubIssueNumber
    };
    
    await onSave(taskData);
  };

  // Fetch task data for editing
  // useEffect(() => {
  //   if (taskId) {
  //     // In a real app, we'd fetch the task from API here
  //     // For now, we'll simulate with mock data or leave empty for manual editing
  //     // reset({
  //     //   title: task.title,
  //     //   description: task.description || '',
  //     //   priority: task.priority,
  //     //   status: task.status,
  //     //   areaId: task.areaId,
  //     //   dueDate: task.dueDate,
  //     //   githubIssueUrl: task.githubIssueUrl,
  //     //   githubIssueNumber: task.githubIssueNumber
  //     // });
  //   }
  // }, [taskId, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{taskId ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input 
                {...register('title', { required: 'Task title is required' })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea 
                {...register('description')}
                rows={4}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <Select 
                {...register('priority')}
                options={[
                  { label: 'Critical', value: 'critical' },
                  { label: 'High', value: 'high' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Low', value: 'low' }
                ]}
              />
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select 
                {...register('status')}
                options={[
                  { label: 'To Do', value: 'todo' },
                  { label: 'In Progress', value: 'in-progress' },
                  { label: 'Done', value: 'done' }
                ]}
              />
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <Select 
                {...register('areaId')}
                options={[
                  { label: 'None', value: null },
                  ...areas.map(area => ({ 
                    label: area.name, 
                    value: area.id 
                  }))
                ]}
                placeholder="Select area"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <DatePicker 
                {...register('dueDate')}
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center mb-3">
              <Checkbox 
                {...register('githubIssueUrl')}
                value="true"
                checked={!!githubIssueData}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setGithubIssueData(null);
                  }
                }}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Link GitHub Issue
              </span>
            </div>
            
            {githubIssueData && (
              <div className="bg-blue-50 p-3 rounded mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 rounded bg-blue-500"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{githubIssueData.title}</p>
                    <a 
                      href={githubIssueData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      github.com/.../issues/{githubIssueData.number}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              disabled={isSubmitting || isSaving}
            >
              {isSubmitting || isSaving ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
