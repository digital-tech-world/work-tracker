import { forwardRef } from 'react';

interface DatePickerProps {
  placeholder?: string;
  className?: string;
  [key: string]: any; // For spreading other props like value, onChange, etc.
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    placeholder = '',
    className = '',
    ...props
  }, ref) => (
    <input
      ref={ref}
      type="date"
      placeholder={placeholder}
      className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white ${className}`}
      {...props}
    />
  )
);

export default DatePicker;
