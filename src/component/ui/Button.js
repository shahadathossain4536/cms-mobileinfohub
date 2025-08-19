import React from 'react';

const base = 'inline-flex items-center justify-center rounded-md h-10 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-brand-primary text-white hover:opacity-90',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;


