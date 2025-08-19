import React from 'react';

const ErrorState = ({ title = 'Something went wrong', message = 'Please try again.', onRetry }) => {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="text-center">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">{title}</p>
        {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center px-4 h-10 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;


