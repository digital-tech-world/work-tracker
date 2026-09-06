import { useState } from 'react';

interface BookmarkTableProps {
  bookmarks: Array<{
    id: number;
    title: string;
    url: string;
    description?: string;
    areaId?: number;
    createdAt: number;
    updatedAt: number;
  }>;
  onEdit: (bookmark: any) => void;
  onDelete: (bookmarkId: number) => void;
}

const BookmarkTable = ({ bookmarks, onEdit, onDelete }: BookmarkTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Sort bookmarks
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
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

  if (sortedBookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookmarks found. Create your first bookmark!</p>
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
              URL
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
          {sortedBookmarks.map(bookmark => (
            <tr key={bookmark.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 rounded bg-blue-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{bookmark.title}</p>
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                    >
                      {bookmark.url}
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all">
                {bookmark.url}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* In a real app, we'd fetch area name from areaId */}
                {bookmark.areaId ? (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    Area {bookmark.areaId}
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
                {new Date(bookmark.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(bookmark)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(bookmark.id)}
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

export default BookmarkTable;
