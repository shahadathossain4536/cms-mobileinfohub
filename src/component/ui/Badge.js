import React from 'react';

const styles = {
  default: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center h-6 px-2 text-xs rounded-full ${styles[variant]} ${className}`}>{children}</span>
);

export default Badge;


