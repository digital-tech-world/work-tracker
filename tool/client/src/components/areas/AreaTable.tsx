import { useState } from 'react';

interface AreaTableProps {
  areas: Array<{id: number; name: string; color: string; taskCount: number; bookmarkCount: number; noteCount: number}>;
  onEdit: (area: any) => void;
  onDelete: (areaId: number) => void;
}

const AreaTable = ({ areas, onEdit, onDelete }: AreaTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Sort areas
  const sortedAreas = [...areas].sort((a, b) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('name')}
            >
              Name
              {sortConfig.key === 'name' && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center">
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Items
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
          {sortedAreas.map(area => (
            <tr key={area.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-3`} 
                    style={{ backgroundColor: area.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{area.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-4">
                  <span>{area.taskCount} Tasks</span>
                  <span>{area.bookmarkCount} Bookmarks</span>
                  <span>{area.noteCount} Notes</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(area)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(area.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {sortedAreas.length === 0 && (
            <tr>
              <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                No areas found. Create your first area!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AreaTable;
