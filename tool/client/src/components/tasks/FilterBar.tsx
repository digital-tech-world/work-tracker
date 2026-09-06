import { useState } from 'react';

interface FilterBarProps {
  areas: Array<{id: number; name: string; color: string}>;
  tags: Array<{id: number; name: string}>;
}

const FilterBar = ({ areas, tags }: FilterBarProps) => {
  const [filters, setFilters] = useState({
    areaId: null as number | null,
    priority: '' as string,
    status: '' as string,
    tagIds: [] as number[],
    dueBefore: null as number | null,
    dueAfter: null as number | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value === '' ? null : value
    }));
  };

  const handleTagChange = (tagId: number) => {
    setFilters(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const handleReset = () => {
    setFilters({
      areaId: null,
      priority: '',
      status: '',
      tagIds: [],
      dueBefore: null,
      dueAfter: null
    });
  };

  // In a real app, these filters would be applied to the API call
  // For now, we'll just show the filter values

  return (
    <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button 
          onClick={handleReset}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Reset
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Area filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
          <select
            name="areaId"
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          >
            <option value="">All Areas</option>
            {areas.map(area => (
              <option 
                key={area.id} 
                value={area.id}
              >
                {area.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Priority filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        {/* Tags filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagChange(tag.id)}
                className={`px-3 py-1 text-xs rounded border 
                          ${filters.tagIds.includes(tag.id) 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Date filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Before</label>
          <input
            type="date"
            name="dueBefore"
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due After</label>
          <input
            type="date"
            name="dueAfter"
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
