import React from 'react';

const EmptyState = ({ title = 'No data', message = 'Nothing to show here yet.', actionLabel, onAction }) => {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</p>
        {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-4 inline-flex items-center px-4 h-10 rounded-md bg-brand-primary text-white hover:opacity-90"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;


