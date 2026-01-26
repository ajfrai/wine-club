import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCharCount, maxLength, className = '', value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-sunburst-600 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-4 py-3 rounded-lg border
            transition-colors duration-200
            ${error
              ? 'border-sunburst-500 focus:border-sunburst-600 focus:ring-sunburst-500'
              : 'border-gray-300 focus:border-sunburst-500 focus:ring-sunburst-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-gray-100 disabled:cursor-not-allowed
            resize-vertical
            ${className}
          `}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p className="text-sm text-sunburst-600">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-500">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
