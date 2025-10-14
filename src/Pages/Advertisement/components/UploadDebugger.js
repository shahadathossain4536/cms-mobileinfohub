import React, { useState } from 'react';
import MediaUploader from './MediaUploader';

const UploadDebugger = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [debugLogs, setDebugLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const handleUpload = (files) => {
    addLog(`Files received: ${files ? files.length : 0} files`);
    if (files && files.length > 0) {
      addLog(`First file details: ${JSON.stringify(files[0], null, 2)}`);
      setUploadedFiles(files);
    } else {
      addLog('No files received');
      setUploadedFiles([]);
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setUploadedFiles([]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Upload Test</h4>
          <MediaUploader
            type="image"
            onUpload={handleUpload}
            placement="ads_top_banner"
            multiple={false}
            className="w-full"
          />
        </div>

        {/* Debug Info */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Debug Information</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Current State:</h5>
            <div className="text-sm text-gray-600">
              <p>Uploaded Files: {uploadedFiles.length}</p>
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <p>File 1 Details:</p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                    {JSON.stringify(uploadedFiles[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-900">Debug Logs:</h5>
              <button
                onClick={clearLogs}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear
              </button>
            </div>
            <div className="text-xs text-gray-600 max-h-48 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1 p-1 bg-white rounded">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backend Status Check */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Backend Status Check</h5>
        <div className="text-sm text-blue-700">
          <p>Expected API URL: {process.env.NODE_ENV === 'development' ? 'http://localhost:2000/api' : 'https://api.mobileinfohub.com/api'}</p>
          <p>Current Environment: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  );
};

export default UploadDebugger;
