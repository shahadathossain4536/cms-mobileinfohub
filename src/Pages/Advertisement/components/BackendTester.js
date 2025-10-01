import React, { useState } from 'react';

const BackendTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testBackendConnection = async () => {
    setIsTesting(true);
    setTestResults([]);

    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:2000/api' 
      : 'https://deviceinfohub-server.vercel.app/api';

    // Test 1: Basic connectivity
    try {
      addResult('Basic Connection', true, 'Testing...', 'Attempting to connect to backend');
      const response = await fetch(`${apiUrl}/advertisements/public/running-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        addResult('Basic Connection', true, 'Successfully connected to backend', data);
      } else {
        addResult('Basic Connection', false, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addResult('Basic Connection', false, `Connection failed: ${error.message}`);
    }

    // Test 2: File upload endpoint
    try {
      addResult('File Upload Endpoint', true, 'Testing...', 'Checking if upload endpoint exists');
      
      // Create a test file
      const testBlob = new Blob(['test content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('image', testFile);
      formData.append('placement', 'ads_top_banner');

      const response = await fetch(`${apiUrl}/uploads/image`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        addResult('File Upload Endpoint', true, 'Upload endpoint is working', data);
      } else {
        const errorText = await response.text();
        addResult('File Upload Endpoint', false, `Upload failed: HTTP ${response.status}`, errorText);
      }
    } catch (error) {
      addResult('File Upload Endpoint', false, `Upload test failed: ${error.message}`);
    }

    // Test 3: CORS headers
    try {
      addResult('CORS Headers', true, 'Testing...', 'Checking CORS configuration');
      const response = await fetch(`${apiUrl}/advertisements/public/running-count`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };

      addResult('CORS Headers', true, 'CORS headers received', corsHeaders);
    } catch (error) {
      addResult('CORS Headers', false, `CORS test failed: ${error.message}`);
    }

    setIsTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Backend Connection Tester</h3>
        <div className="flex space-x-2">
          <button
            onClick={testBackendConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Run Tests'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-900 mb-1">Test Information</h4>
        <div className="text-sm text-blue-700">
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>API URL:</strong> {process.env.NODE_ENV === 'development' ? 'http://localhost:2000/api' : 'https://deviceinfohub-server.vercel.app/api'}</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className={`text-lg mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <h5 className="font-medium text-gray-900">{result.test}</h5>
                    <span className="ml-auto text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">Show Details</summary>
                      <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-32">
                        {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isTesting && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔧</div>
          <p>Click "Run Tests" to check backend connectivity</p>
        </div>
      )}

      {isTesting && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Running backend tests...</p>
        </div>
      )}
    </div>
  );
};

export default BackendTester;
