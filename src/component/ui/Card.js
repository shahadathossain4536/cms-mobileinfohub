import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-4 py-3 ${className}`}>{children}</div>
);

export default Card;


