import { forwardRef } from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  className?: string;
  [key: string]: any; // For spreading other props like value, onChange, etc.
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    type = 'text',
    placeholder = '',
    className = '',
    ...props
  }, ref) => (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);

export default Input;
