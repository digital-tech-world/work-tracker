import { useState } from 'react';

interface NoteTableProps {
  notes: Array<{
    id: number;
    title: string;
    content: string;
    areaId?: number;
    createdAt: number;
    updatedAt: number;
  }>;
  onEdit: (note: any) => void;
  onDelete: (noteId: number) => void;
}

const NoteTable = ({ notes, onEdit, onDelete }: NoteTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
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

  if (sortedNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notes found. Create your first note!</p>
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
              Content Preview
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
              Tags
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Created
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
          {sortedNotes.map(note => (
            <tr key={note.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 rounded bg-purple-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{note.title}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* In a real app, we'd fetch area name from areaId */}
                {note.areaId ? (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    Area {note.areaId}
                  </span>
                ) : (
                  <span className="text-gray-400">No Area</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* Tags would be displayed here in a real app */}
                <span className="text-gray-400">No tags</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(note)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
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

export default NoteTable;
