import { forwardRef } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  [key: string]: any; // For spreading other props like value, etc.
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    checked = false,
    onChange,
    className = '',
    ...props
  }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${className}`}
      {...props}
    />
  )
);

export default Checkbox;
