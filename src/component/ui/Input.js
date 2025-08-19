import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  leftIcon,
  rightIcon,
  helperText,
  required = false,
  ...props 
}, ref) => {
  const inputClasses = `
    h-11 w-full rounded-lg border transition-all duration-200 outline-none
    ${leftIcon ? 'pl-14' : 'pl-3'}
    ${rightIcon ? 'pr-14' : 'pr-3'}
    ${error 
      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary'
    }
    bg-white dark:bg-slate-900 text-slate-900 dark:text-white 
    placeholder-slate-500 dark:placeholder-slate-400
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
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
            <span className="text-slate-400">{leftIcon}</span>
          </div>
        )}
        <input 
          ref={ref}
          className={inputClasses} 
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none z-10">
            <span className="text-slate-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;