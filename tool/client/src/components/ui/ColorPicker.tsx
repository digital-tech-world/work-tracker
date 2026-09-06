import { forwardRef } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, className = '' }, ref) => {
    const colors = [
      '#3B82F6', // blue
      '#EC4899', // pink
      '#10B981', // emerald
      '#F59E0B', // amber
      '#8B5CF6', // violet
      '#EF4444', // red
      '#6B7280', // gray
      '#84CC16', // lime
      '#06B6D4', // cyan
      '#F97316'  // orange
    ];

    const handleColorClick = (color: string) => {
      onChange(color);
    };

    return (
      <div
        ref={ref}
        className={`flex space-x-2 ${className}`}
      >
        {colors.map(color => (
          <div
            key={color}
            className={`w-8 h-8 rounded-full border cursor-pointer 
                      ${value === color ? 'ring-2 ring-primary-500' : 'border-gray-200'}
                      hover:border-gray-300 transition-colors`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
    );
  }
);

export default ColorPicker;
