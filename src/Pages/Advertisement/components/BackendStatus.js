import React, { useState, useEffect } from 'react';

const BackendStatus = ({ onBackendAvailable }) => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    
    const localUrl = 'http://localhost:2000/api';
    const productionUrl = 'https://api.mobileinfohub.com/api';
    
    // Try local first in development
    const urlToCheck = process.env.NODE_ENV === 'development' ? localUrl : productionUrl;
    setBackendUrl(urlToCheck);
    
    try {
      const response = await fetch(`${urlToCheck}/advertisements/public/running-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setIsBackendAvailable(true);
        if (onBackendAvailable) {
          onBackendAvailable(true);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('Backend not available:', error.message);
      setIsBackendAvailable(false);
      if (onBackendAvailable) {
        onBackendAvailable(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700">Checking backend connection...</span>
        </div>
      </div>
    );
  }

  if (!isBackendAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-3 mt-0.5">⚠️</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Backend Server Not Available
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              The advertisement backend server is not running. Please start the backend server to use the advertisement features.
            </p>
            <div className="mt-3 space-y-2">
              <div className="text-xs text-yellow-600">
                <strong>Expected URL:</strong> {backendUrl}
              </div>
              <div className="text-xs text-yellow-600">
                <strong>To start the backend:</strong>
              </div>
              <div className="bg-yellow-100 rounded p-2 text-xs font-mono text-yellow-800">
                cd deviceinfohub-server<br/>
                npm start
              </div>
            </div>
            <button
              onClick={checkBackendStatus}
              className="mt-3 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="text-green-600 mr-3">✅</div>
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Backend Server Connected
          </h3>
          <p className="text-sm text-green-700">
            Connected to: {backendUrl}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;
