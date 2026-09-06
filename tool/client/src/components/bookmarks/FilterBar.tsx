import { useState } from 'react';

interface FilterBarProps {
  areas: Array<{id: number; name: string; color: string}>;
  tags: Array<{id: number; name: string}>;
}

const FilterBar = ({ areas, tags }: FilterBarProps) => {
  const [filters, setFilters] = useState({
    areaId: null as number | null,
    tagIds: [] as number[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value)
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
      tagIds: []
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
      
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );
};

export default FilterBar;
