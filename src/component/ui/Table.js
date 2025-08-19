import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        {children}
      </table>
    </div>
  </div>
);

export const THead = ({ children, className = '' }) => (
  <thead className={`bg-slate-50 dark:bg-slate-900/50 ${className}`}>
    {children}
  </thead>
);

export const TBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 ${className}`}>
    {children}
  </tbody>
);

export const TR = ({ children, className = '', hover = true }) => (
  <tr className={`${hover ? 'hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-150' : ''} ${className}`}>
    {children}
  </tr>
);

export const TH = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TD = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </td>
);

export default Table;