import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  showCount,
  maxLength,
  value,
  className = '',
  ...props
}: TextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className}`}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {showCount && (
          <p className={`text-xs ml-auto ${charCount > (maxLength || 9999) ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''} 字
          </p>
        )}
      </div>
    </div>
  );
}
