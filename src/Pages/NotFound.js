import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-semibold mb-3">404</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">The page you are looking for does not exist.</p>
      <Link to="/login" className="px-4 h-10 inline-flex items-center rounded-md bg-indigo-600 text-white">Go Home</Link>
    </div>
  );
};

export default NotFound;


