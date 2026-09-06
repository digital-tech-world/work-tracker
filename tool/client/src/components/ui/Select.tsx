import { forwardRef } from 'react';

interface SelectProps {
  placeholder?: string;
  className?: string;
  [key: string]: any; // For spreading other props like value, onChange, options, etc.
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    placeholder = '',
    className = '',
    ...props
  }, ref) => (
    <select
      ref={ref}
      className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white bg-no-repeat 
                bg-right-2.5 center bg-contain [url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\"/></svg>']`}
      {...props}
    >
      {props.children || (
        <option value="" disabled hidden>
          {placeholder || 'Select...'}
        </option>
      )}
    </select>
  )
);

export default Select;
