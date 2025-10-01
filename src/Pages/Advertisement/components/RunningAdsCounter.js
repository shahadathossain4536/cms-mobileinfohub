import React, { useState, useEffect } from 'react';
import { advertisementAPI } from '../utils/advertisementUtils';

const RunningAdsCounter = ({ 
  count: initialCount, 
  refreshInterval = 30000,
  className = '',
  showDetails = true
}) => {
  const [currentCount, setCurrentCount] = useState(initialCount || 0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  const fetchRunningCount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await advertisementAPI.getRunningCount();
      
      if (response.success) {
        setCurrentCount(response.data.runningAds);
        setDetails(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to fetch running ads count');
      }
    } catch (error) {
      console.error('Error fetching running ads count:', error);
      setError('Error fetching running ads count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchRunningCount();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchRunningCount, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatLastUpdated = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  const getStatusColor = () => {
    if (loading) return 'text-blue-600';
    if (error) return 'text-red-600';
    if (currentCount === 0) return 'text-gray-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (loading) return '⏳';
    if (error) return '⚠️';
    if (currentCount === 0) return '📊';
    return '🎯';
  };

  return (
    <div className={`running-ads-counter ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{getStatusIcon()}</div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Currently Running</h3>
              <p className={`text-2xl font-bold ${getStatusColor()}`}>
                {loading ? '...' : currentCount}
              </p>
              <p className="text-xs text-gray-500">Advertisement{currentCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="text-right">
            <button
              onClick={fetchRunningCount}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh count"
            >
              <svg 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
            <p className="text-xs text-gray-400 mt-1">
              {formatLastUpdated(lastUpdated)}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Additional Details */}
        {showDetails && details && !loading && !error && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Total Impressions:</span>
                <p className="font-medium text-gray-900">
                  {details.totalImpressions?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Clicks:</span>
                <p className="font-medium text-gray-900">
                  {details.totalClicks?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Click Rate:</span>
                <p className="font-medium text-gray-900">
                  {details.clickRate ? `${(details.clickRate * 100).toFixed(2)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Revenue:</span>
                <p className="font-medium text-green-600">
                  ${details.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-3 flex items-center text-xs text-blue-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
            Updating...
          </div>
        )}
      </div>
    </div>
  );
};

export default RunningAdsCounter;
