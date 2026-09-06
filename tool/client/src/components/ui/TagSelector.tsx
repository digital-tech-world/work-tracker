import { useState } from 'react';

interface TagSelectorProps {
  placeholder?: string;
  className?: string;
  [key: string]: any; // For spreading other props like value, onChange, options, etc.
}

const TagSelector = ({ 
  placeholder = 'Select tags...',
  className = '',
  options = [],
  value = [],
  onChange,
  ...props 
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<any[]>(value || []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: any) => {
    const isSelected = selectedValues.some(v => v.value === option.value);
    if (isSelected) {
      setSelectedValues(selectedValues.filter(v => v.value !== option.value));
    } else {
      setSelectedValues([...selectedValues, option]);
    }
    if (onChange) onChange(selectedValues.map(v => v.value));
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0
                  hover:bg-gray-50 cursor-default ${isOpen ? 'border-indigo-500' : ''}`}
      >
        {selectedValues.length > 0 ? (
          <>
            {selectedValues.slice(0, 3).map((option, index) => (
              <span key={index} className="mr-1 mb-1 px-2 py-0.5 text-xs rounded 
                          bg-primary-100 text-primary-800">
                {option.label}
              </span>
            ))}
            {selectedValues.length > 3 && (
              <span className="mr-1 mb-1 px-2 py-0.5 text-xs rounded 
                          bg-primary-100 text-primary-800">
                +{selectedValues.length - 3} more
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <span className="ml-2 h-4 w-4 inline-flex items-center justify-center">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full border border-gray-300 rounded-md shadow-lg bg-white">
          <div className="px-2 py-2">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => toggleOption(option)}
                className={`px-3 py-2 text-sm cursor-pointer 
                          ${selectedValues.some(v => v.value === option.value) 
                            ? 'bg-primary-50 text-primary-800' 
                            : 'hover:bg-gray-50'}`}
              >
                {option.label}
              </div>
            ))}
            {filteredOptions.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No tags found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
