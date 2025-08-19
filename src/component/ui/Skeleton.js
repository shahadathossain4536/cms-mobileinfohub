import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

export const ListSkeleton = ({ rows = 6 }) => (
  <div className='space-y-2'>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className='h-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse' />
    ))}
  </div>
);

export default Skeleton;


