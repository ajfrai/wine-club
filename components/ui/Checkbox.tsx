import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5 mt-1">
            <input
              ref={ref}
              type="checkbox"
              className={`
                w-5 h-5 rounded border-gray-300
                text-sunburst-600 focus:ring-sunburst-500 focus:ring-2
                cursor-pointer
                ${error ? 'border-sunburst-500' : ''}
                ${className}
              `}
              {...props}
            />
          </div>
          {label && (
            <label className="ml-3 text-sm text-gray-700 cursor-pointer">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-sunburst-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
