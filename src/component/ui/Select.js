import React, { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  children, 
  className = '', 
  required = false,
  helperText,
  ...props 
}, ref) => {
  const selectClasses = `
    h-11 w-full px-3 rounded-lg border transition-all duration-200 outline-none
    ${error 
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary'
    }
    bg-white dark:bg-slate-900 text-slate-900 dark:text-white
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select 
        ref={ref}
        className={selectClasses} 
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;