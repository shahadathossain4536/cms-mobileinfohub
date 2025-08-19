import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => (
  <div 
    className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-slate-200 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;