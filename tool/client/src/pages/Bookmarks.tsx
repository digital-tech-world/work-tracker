import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import BookmarkForm from '../components/bookmarks/BookmarkForm';
import BookmarkTable from '../components/bookmarks/BookmarkTable';
import FilterBar from '../components/bookmarks/FilterBar';
import StatusTabs from '../components/bookmarks/StatusTabs';

const BookmarksPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State for modal/form visibility
  const [bookmarkFormOpen, setBookmarkFormOpen] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<number | null>(null);
  
  // Fetch bookmarks
  const { data: bookmarks = [], isLoading, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await fetch('/api/bookmarks');
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
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
  
  // Bookmark mutation (create/update)
  const { mutate: saveBookmark, isLoading: isSaving } = useMutation({
    mutationFn: async (bookmarkData: any) => {
      const method = bookmarkData.id ? 'PATCH' : 'POST';
      const url = bookmarkData.id ? `/api/bookmarks/${bookmarkData.id}` : '/api/bookmarks';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarkData)
      });
      
      if (!response.ok) throw new Error('Failed to save bookmark');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setBookmarkFormOpen(false);
      setEditingBookmarkId(null);
    }
  });
  
  // Bookmark deletion mutation
  const { mutate: deleteBookmark, isLoading: isDeleting } = useMutation({
    mutationFn: async (bookmarkId: number) => {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete bookmark');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    }
  });
  
  // Handle form submission
  const handleSaveBookmark = async (bookmarkData: any) => {
    await saveBookmark(bookmarkData);
  };
  
  // Handle bookmark deletion
  const handleDeleteBookmark = (bookmarkId: number) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      deleteBookmark(bookmarkId);
    }
  };
  
  // Open bookmark form for creating new bookmark
  const handleCreateBookmark = () => {
    setEditingBookmarkId(null);
    setBookmarkFormOpen(true);
  };
  
  // Open bookmark form for editing existing bookmark
  const handleEditBookmark = (bookmark: any) => {
    setEditingBookmarkId(bookmark.id);
    setBookmarkFormOpen(true);
  };
  
  if (isLoading) return <div className="col-span-3 p-6">Loading bookmarks...</div>;
  if (error) return <div className="col-span-3 p-6 text-red-500">Error: {(error as Error).message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <Button 
          variant="primary" 
          onClick={handleCreateBookmark}
          isLoading={isSaving}
        >
          New Bookmark
        </Button>
      </div>
      
      {/* Filter bar */}
      <FilterBar 
        areas={areas} 
        tags={tags}
      />
      
      {/* Bookmark table */}
      <BookmarkTable 
        bookmarks={bookmarks} 
        onEdit={handleEditBookmark} 
        onDelete={handleDeleteBookmark}
      />
      
      {/* Bookmark form modal */}
      <BookmarkForm 
        bookmarkId={editingBookmarkId}
        isOpen={bookmarkFormOpen}
        areas={areas}
        tags={tags}
        onClose={() => setBookmarkFormOpen(false)}
        onSave={handleSaveBookmark}
        isSaving={isSaving}
      />
    </div>
  );
};

export default BookmarksPage;
