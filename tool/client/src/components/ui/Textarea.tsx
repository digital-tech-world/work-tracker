import { forwardRef } from 'react';

interface TextareaProps {
  placeholder?: string;
  className?: string;
  rows?: number;
  [key: string]: any; // For spreading other props like value, onChange, etc.
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    placeholder = '',
    className = '',
    rows = 4,
    ...props
  }, ref) => (
    <textarea
      ref={ref}
      placeholder={placeholder}
      className={`flex min-h-[3rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
      rows={rows}
      {...props}
    />
  )
);

export default Textarea;
