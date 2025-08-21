import React from 'react';
import { useIsFetching, useIsMutating } from 'react-query';

const LoadingOverlay = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const show = isFetching > 0 || isMutating > 0;

  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 px-3 h-10 rounded-md bg-white/90 dark:bg-slate-800/90 shadow">
          <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-sm">Updating…</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;


