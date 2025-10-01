import React, { useState, useEffect } from 'react';
import { advertisementAPI, formatCurrency, getPositionFromCategory } from '../utils/advertisementUtils';
import { formatFileSize } from '../utils/fileUploadUtils';

const CostCalculator = ({ 
  placement, 
  duration, 
  type, 
  onCostChange,
  uploadedFiles = [],
  className = ''
}) => {
  const [costEstimate, setCostEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (duration && type && placement && duration > 0) {
      calculateCost();
    } else {
      setCostEstimate(null);
      setError(null);
    }
  }, [placement, duration, type]);

  const calculateCost = async () => {
    if (!duration || !type || !placement) return;

    setLoading(true);
    setError(null);

    try {
      const position = getPositionFromCategory(placement);
      const response = await advertisementAPI.calculateCost(placement, position, duration, type);
      
      if (response.success) {
        setCostEstimate(response.data);
        if (onCostChange) {
          onCostChange(response.data);
        }
      } else {
        setError(response.message || 'Failed to calculate cost');
      }
    } catch (error) {
      console.error('Error calculating cost:', error);
      setError('Error calculating cost. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`cost-calculator ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Calculating cost...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cost-calculator ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!costEstimate) {
    return (
      <div className={`cost-calculator ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-gray-600 mr-2">💰</div>
            <span className="text-gray-700">
              Enter duration to see cost estimate
            </span>
          </div>
        </div>
      </div>
    );
  }

  const { pricing, availability, slot } = costEstimate;

  return (
    <div className={`cost-calculator ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">💰</div>
          <h3 className="text-lg font-semibold text-gray-900">Cost Estimate</h3>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Base Rate:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(pricing.baseRate)} per {slot.rateType.replace('per_', '')}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">{duration} days</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Advertisement Type:</span>
            <span className="font-medium text-gray-900 capitalize">{type}</span>
          </div>
          
          {pricing.discount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Discount:</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(pricing.discount)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
            <span className="text-base font-semibold text-gray-900">Total Cost:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(pricing.totalCost)}
            </span>
          </div>
        </div>

        {/* Slot Availability */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            availability.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              availability.isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {availability.message}
          </div>
          
          {availability.details && (
            <p className="text-xs text-gray-500 mt-1">
              {availability.details}
            </p>
          )}
        </div>

        {/* Slot Information */}
        {slot && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Slot Details</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Max Concurrent Ads:</span>
                <span>{slot.maxConcurrentAds}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Active:</span>
                <span>{slot.currentActiveAds}</span>
              </div>
              {slot.dimensions && (
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{slot.dimensions.width} × {slot.dimensions.height}px</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Upload Info */}
        {uploadedFiles.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex justify-between text-xs text-blue-700">
                  <span className="truncate max-w-48">{file.originalName}</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• Cost is calculated based on current rates and slot availability</p>
          <p>• Payment is required before advertisement goes live</p>
          <p>• Rates may change based on demand and seasonality</p>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
