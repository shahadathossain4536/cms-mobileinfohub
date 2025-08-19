import React from 'react';

const styles = {
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-xs',
  lg: 'px-3 py-2 text-sm',
};

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  dot = false,
  ...props 
}) => (
  <span 
    className={`inline-flex items-center font-medium rounded-full ${styles[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />}
    {children}
  </span>
);

export default Badge;