import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

const noteSchema = z.object({
  title: z.string().min(1, 'Note title is required'),
  content: z.string().min(1, 'Note content is required'),
  areaId: z.number().int().positive().optional().nullable()
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  noteId: number | null;
  isOpen: boolean;
  areas: Array<{id: number; name: string; color: string}>;
  tags: Array<{id: number; name: string}>;
  onClose: () => void;
  onSave: (data: NoteFormValues) => Promise<void>;
  isSaving: boolean;
}

const NoteForm = ({ noteId, isOpen, areas, tags, onClose, onSave, isSaving }: NoteFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      areaId: null
    }
  });

  const onSubmit = async (data: NoteFormValues) => {
    await onSave(data);
  };

  // Fetch note data for editing (simplified)
  // useEffect(() => {
  //   if (noteId) {
  //     // In a real app, we'd fetch the note from API here
  //     // reset({
  //     //   title: note.title,
  //     //   content: note.content,
  //     //   areaId: note.areaId
  //     // });
  //   }
  // }, [noteId, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{noteId ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input 
              {...register('title', { required: 'Note title is required' })}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <Textarea 
              {...register('content', { required: 'Note content is required' })}
              rows={8}
            />
          </div>
          
          <div className="border-t pt-4">
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
              {isSubmitting || isSaving ? 'Saving...' : noteId ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
