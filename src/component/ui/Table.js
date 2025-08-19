import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
    <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      {children}
    </div>
  </div>
);

export const THead = ({ children }) => (
  <div className="bg-slate-100 dark:bg-slate-700/50">
    <div className="grid grid-cols-12 px-4 h-12 items-center text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
    </div>
  </div>
);

export const TBody = ({ children }) => (
  <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
    {children}
  </div>
);

export const TR = ({ children }) => (
  <div className="grid grid-cols-12 px-4 h-16 items-center">
    {children}
  </div>
);

export const TH = ({ className = '', children }) => (
  <div className={`col-span-2 ${className}`}>{children}</div>
);

export const TD = ({ className = '', children }) => (
  <div className={`col-span-2 ${className}`}>{children}</div>
);

export default Table;


