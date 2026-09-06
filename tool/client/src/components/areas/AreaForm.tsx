import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import ColorPicker from '../ui/ColorPicker';

const areaSchema = z.object({
  name: z.string().min(1, 'Area name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#6366f1'),
  githubRepo: z.string().url().optional().nullable()
});

type AreaFormValues = z.infer<typeof areaSchema>;

interface AreaFormProps {
  area: {
    id: number;
    name: string;
    description?: string;
    color?: string;
    githubRepo?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AreaFormValues) => Promise<void>;
  isSaving: boolean;
}

const AreaForm = ({ area, isOpen, onClose, onSave, isSaving }: AreaFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area?.name || '',
      description: area?.description || '',
      color: area?.color || '#6366f1',
      githubRepo: area?.githubRepo || null
    }
  });

  const onSubmit = async (data: AreaFormValues) => {
    await onSave(data);
  };

  useEffect(() => {
    if (area) {
      reset({
        name: area.name,
        description: area.description || '',
        color: area.color || '#6366f1',
        githubRepo: area.githubRepo || null
      });
    }
  }, [area, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-white border rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{area ? 'Edit Area' : 'New Area'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input 
              {...register('name', { required: 'Area name is required' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea 
              {...register('description')}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <ColorPicker 
              {...register('color')} 
              defaultValue={area?.color || '#6366f1'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository (optional)</label>
            <Input 
              {...register('githubRepo')}
              type="url"
              placeholder="https://github.com/username/repo"
            />
            {errors.githubRepo && <p className="mt-1 text-sm text-red-600">{errors.githubRepo.message}</p>}
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
              {isSubmitting || isSaving ? 'Saving...' : area ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaForm;
