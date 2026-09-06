import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import NoteForm from '../components/notes/NoteForm';
import NoteTable from '../components/notes/NoteTable';
import FilterBar from '../components/notes/FilterBar';

const NotesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State for modal/form visibility
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  
  // Fetch notes
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
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
  
  // Note mutation (create/update)
  const { mutate: saveNote, isLoading: isSaving } = useMutation({
    mutationFn: async (noteData: any) => {
      const method = noteData.id ? 'PATCH' : 'POST';
      const url = noteData.id ? `/api/notes/${noteData.id}` : '/api/notes';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) throw new Error('Failed to save note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNoteFormOpen(false);
      setEditingNoteId(null);
    }
  });
  
  // Note deletion mutation
  const { mutate: deleteNote, isLoading: isDeleting } = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
  
  // Handle form submission
  const handleSaveNote = async (noteData: any) => {
    await saveNote(noteData);
  };
  
  // Handle note deletion
  const handleDeleteNote = (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };
  
  // Open note form for creating new note
  const handleCreateNote = () => {
    setEditingNoteId(null);
    setNoteFormOpen(true);
  };
  
  // Open note form for editing existing note
  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNoteFormOpen(true);
  };
  
  if (isLoading) return <div className="col-span-3 p-6">Loading notes...</div>;
  if (error) return <div className="col-span-3 p-6 text-red-500">Error: {(error as Error).message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button 
          variant="primary" 
          onClick={handleCreateNote}
          isLoading={isSaving}
        >
          New Note
        </Button>
      </div>
      
      {/* Filter bar */}
      <FilterBar 
        areas={areas} 
        tags={tags}
      />
      
      {/* Note table */}
      <NoteTable 
        notes={notes} 
        onEdit={handleEditNote} 
        onDelete={handleDeleteNote}
      />
      
      {/* Note form modal */}
      <NoteForm 
        noteId={editingNoteId}
        isOpen={noteFormOpen}
        areas={areas}
        tags={tags}
        onClose={() => setNoteFormOpen(false)}
        onSave={handleSaveNote}
        isSaving={isSaving}
      />
    </div>
  );
};

export default NotesPage;
