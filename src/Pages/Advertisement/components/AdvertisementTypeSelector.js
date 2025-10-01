import React from 'react';
import { advertisementTypes } from '../utils/advertisementUtils';

const AdvertisementTypeSelector = ({ 
  selectedType, 
  onTypeChange, 
  disabled = false,
  className = ''
}) => {
  const handleTypeChange = (type) => {
    if (!disabled && onTypeChange) {
      onTypeChange(type);
    }
  };

  return (
    <div className={`advertisement-type-selector ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Advertisement Type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {advertisementTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Selection Indicator */}
              {selectedType === type.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Type Icon */}
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">
                  {type.value === 'photo' ? '🖼️' : 
                   type.value === 'video' ? '🎥' : 
                   '🎞️'}
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  {type.label}
                </h4>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-4">
                {type.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {type.value === 'photo' && (
                  <>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Single image display
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Fast loading
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      High visibility
                    </div>
                  </>
                )}

                {type.value === 'video' && (
                  <>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Engaging video content
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Auto-play support
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Sound optional
                    </div>
                  </>
                )}

                {type.value === 'slider' && (
                  <>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Multiple images & videos
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Interactive navigation
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Auto-rotation
                    </div>
                  </>
                )}
              </div>

              {/* Recommended Badge */}
              {type.value === 'photo' && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Most Popular
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <div className="text-gray-400 mr-2 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Need help choosing?</p>
              <ul className="text-xs space-y-1">
                <li>• <strong>Photo:</strong> Best for simple, eye-catching advertisements</li>
                <li>• <strong>Video:</strong> Perfect for engaging, dynamic content</li>
                <li>• <strong>Mixed Slider:</strong> Ideal for showcasing multiple products or features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementTypeSelector;
