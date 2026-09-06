import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import TaskTable from '../components/tasks/TaskTable';
import BookmarkTable from '../components/bookmarks/BookmarkTable';
import NoteTable from '../components/notes/NoteTable';
import FilterBar from '../components/tasks/FilterBar';
import StatusTabs from '../components/tasks/StatusTabs';
import TagSelector from '../components/ui/TagSelector';

const AreaDetailPage = () => {
  const { id: areaIdParam } = useParams<{ id: string }>();
  const areaId = areaIdParam ? parseInt(areaIdParam) : null;
  const queryClient = useQueryClient();
  
  // State for modals
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [bookmarkFormOpen, setBookmarkFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingBookmarkId, setEditingBookmarkId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  
  // Fetch area info
  const { data: area, isLoading: areaLoading, error: areaError } = useQuery({
    queryKey: ['area', areaId],
    queryFn: async () => {
      if (!areaId) throw new Error('Area ID is required');
      const response = await fetch(`/api/areas/${areaId}`);
      if (!response.ok) throw new Error('Failed to fetch area');
      return response.json();
    },
    enabled: !!areaId
  });
  
  // Fetch tasks for this area
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', areaId],
    queryFn: async () => {
      if (!areaId) return [];
      const response = await fetch(`/api/tasks?areaId=${areaId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    enabled: !!areaId
  });
  
  // Fetch bookmarks for this area
  const { data: bookmarks = [], isLoading: bookmarksLoading, error: bookmarksError } = useQuery({
    queryKey: ['bookmarks', areaId],
    queryFn: async () => {
      if (!areaId) return [];
      const response = await fetch(`/api/bookmarks?areaId=${areaId}`);
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      return response.json();
    },
    enabled: !!areaId
  });
  
  // Fetch notes for this area
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useQuery({
    queryKey: ['notes', areaId],
    queryFn: async () => {
      if (!areaId) return [];
      const response = await fetch(`/api/notes?areaId=${areaId}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    enabled: !!areaId
  });
  
  // Fetch areas for dropdowns in forms
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas');
      if (!response.ok) throw new Error('Failed to fetch areas');
      return response.json();
    }
  });
  
  // Fetch tags for dropdowns in forms
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });
  
  // Task mutation (create/update)
  const { mutate: saveTask, isLoading: isSavingTask } = useMutation({
    mutationFn: async (taskData: any) => {
      const method = taskData.id ? 'PATCH' : 'POST';
      const url = taskData.id ? `/api/tasks/${taskData.id}` : '/api/tasks';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, areaId }) // Ensure areaId is set
      });
      
      if (!response.ok) throw new Error('Failed to save task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', areaId] });
      setTaskFormOpen(false);
      setEditingTaskId(null);
    }
  });
  
  // Bookmark mutation (create/update)
  const { mutate: saveBookmark, isLoading: isSavingBookmark } = useMutation({
    mutationFn: async (bookmarkData: any) => {
      const method = bookmarkData.id ? 'PATCH' : 'POST';
      const url = bookmarkData.id ? `/api/bookmarks/${bookmarkData.id}` : '/api/bookmarks';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookmarkData, areaId }) // Ensure areaId is set
      });
      
      if (!response.ok) throw new Error('Failed to save bookmark');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', areaId] });
      setBookmarkFormOpen(false);
      setEditingBookmarkId(null);
    }
  });
  
  // Note mutation (create/update)
  const { mutate: saveNote, isLoading: isSavingNote } = useMutation({
    mutationFn: async (noteData: any) => {
      const method = noteData.id ? 'PATCH' : 'POST';
      const url = noteData.id ? `/api/notes/${noteData.id}` : '/api/notes';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, areaId }) // Ensure areaId is set
      });
      
      if (!response.ok) throw new Error('Failed to save note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', areaId] });
      setNoteFormOpen(false);
      setEditingNoteId(null);
    }
  });
  
  // Handle form submissions
  const handleSaveTask = async (taskData: any) => {
    await saveTask(taskData);
  };
  
  const handleSaveBookmark = async (bookmarkData: any) => {
    await saveBookmark(bookmarkData);
  };
  
  const handleSaveNote = async (noteData: any) => {
    await saveNote(noteData);
  };
  
  // Handle deletions (would need delete mutations similar to above)
  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Would call delete mutation here
      console.log('Would delete task:', taskId);
    }
  };
  
  const handleDeleteBookmark = (bookmarkId: number) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      // Would call delete mutation here
      console.log('Would delete bookmark:', bookmarkId);
    }
  };
  
  const handleDeleteNote = (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // Would call delete mutation here
      console.log('Would delete note:', noteId);
    }
  };
  
  // Open form handlers
  const handleCreateTask = () => {
    setEditingTaskId(null);
    setTaskFormOpen(true);
  };
  
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setTaskFormOpen(true);
  };
  
  const handleCreateBookmark = () => {
    setEditingBookmarkId(null);
    setBookmarkFormOpen(true);
  };
  
  const handleEditBookmark = (bookmark: any) => {
    setEditingBookmarkId(bookmark.id);
    setBookmarkFormOpen(true);
  };
  
  const handleCreateNote = () => {
    setEditingNoteId(null);
    setNoteFormOpen(true);
  };
  
  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNoteFormOpen(true);
  };
  
  if (areaLoading) return <div className="p-6">Loading area...</div>;
  if (areaError) return <div className="p-6 text-red-500">Error: {(areaError as Error).message}</div>;
  if (!area) return <div className="p-6 text-red-500">Area not found</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-8 h-8 rounded-full`} 
            style={{ backgroundColor: area.color }}
          ></div>
          <h1 className="text-2xl font-bold">{area.name}</h1>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleCreateTask}
            isLoading={isSavingTask}
          >
            New Task
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateBookmark}
            isLoading={isSavingBookmark}
          >
            New Bookmark
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateNote}
            isLoading={isSavingNote}
          >
            New Note
          </Button>
        </div>
      </div>
      
      {area.description && (
        <p className="mb-6 text-gray-600">{area.description}</p>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks</h3>
          <p className="text-2xl font-bold text-primary-600">{tasks.length}</p>
          <p className="text-sm text-gray-500">
            {tasks.filter(t => t.status === 'todo').length} todo • 
            {tasks.filter(t => t.status === 'in-progress').length} in progress • 
            {tasks.filter(t => t.status === 'done').length} done
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bookmarks</h3>
          <p className="text-2xl font-bold text-primary-600">{bookmarks.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
          <p className="text-2xl font-bold text-primary-600">{notes.length}</p>
        </div>
      </div>
      
      {/* Tabs for different content types */}
      <div className="border-b border-gray-200 mb-6">
        <button
          onClick={() => {}}
          className={`px-4 py-2 text-sm font-medium 
                    border-b-2 border-primary-500 text-primary-600`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => {}}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => {}}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Notes ({notes.length})
        </button>
      </div>
      
      {/* Tasks section */}
      {!tasksLoading && (
        <>
          <h2 className="text-xl font-bold mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks in this area yet.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <FilterBar 
                  areas={areas} 
                  tags={tags}
                />
                <StatusTabs 
                  tasks={tasks} 
                  onStatusChange={() => {}}
                />
              </div>
              <TaskTable 
                tasks={tasks} 
                onEdit={handleEditTask} 
                onDelete={handleDeleteTask}
                onStatusChange={() => {}}
              />
            </>
          )}
          
          {/* Task form modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{editingTaskId ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => setTaskFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons">close</span>
                </button>
              </div>
              
              {/* Simplified task form for AreaDetail */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text"
                    placeholder="Enter task title"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Enter task description"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setTaskFormOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    {editingTaskId ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      
      {/* Bookmarks section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="text-gray-500">No bookmarks in this area yet.</p>
        ) : (
          <>
            <div className="mb-4">
              <FilterBar 
                areas={areas} 
                tags={tags}
              />
            </div>
            <BookmarkTable 
              bookmarks={bookmarks} 
              onEdit={handleEditBookmark} 
              onDelete={handleDeleteBookmark}
            />
          </>
        )}
        
        {/* Bookmark form modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{editingBookmarkId ? 'Edit Bookmark' : 'New Bookmark'}</h2>
              <button onClick={() => setBookmarkFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            {/* Simplified bookmark form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text"
                  placeholder="Enter bookmark title"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input 
                  type="url"
                  placeholder="https://example.com"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Enter bookmark description"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                >
                  <option value="">No Area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setBookmarkFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {editingBookmarkId ? 'Update Bookmark' : 'Create Bookmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Notes section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes in this area yet.</p>
        ) : (
          <>
            <div className="mb-4">
              <FilterBar 
                areas={areas} 
                tags={tags}
              />
            </div>
            <NoteTable 
              notes={notes} 
              onEdit={handleEditNote} 
              onDelete={handleDeleteNote}
            />
          </>
        )}
        
        {/* Note form modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-xl p-6 bg-white border rounded-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{editingNoteId ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setNoteFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            {/* Simplified note form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text"
                  placeholder="Enter note title"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea 
                  rows={6}
                  placeholder="Enter note content (markdown supported)"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                >
                  <option value="">No Area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setNoteFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {editingNoteId ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
    </div>
  );
};

export default AreaDetailPage;
