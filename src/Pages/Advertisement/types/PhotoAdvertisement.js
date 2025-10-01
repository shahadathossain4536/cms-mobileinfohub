import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import MediaUploader from '../components/MediaUploader';
import AdvertisementPreview from '../components/AdvertisementPreview';
import CostCalculator from '../components/CostCalculator';
import DatePickerWithAvailability from '../components/DatePickerWithAvailability';
import { advertisementAPI, getPositionFromCategory, validateAdvertisementData } from '../utils/advertisementUtils';

const PhotoAdvertisement = ({ placement, onCostChange }) => {
  const { register, handleSubmit, formState: { errors }, watch, reset, getValues, setValue } = useForm();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [costEstimate, setCostEstimate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const watchedTitle = watch('title');
  const watchedDuration = watch('duration');
  
  // Force get current values directly
  const actualDuration = getValues('duration') || watchedDuration;
  const actualTitle = getValues('title') || watchedTitle;


  // Format date to YYYY-MM-DD
  const formatDateKey = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
  };

  const handleImageUpload = (files) => {
    console.log('📥 PhotoAdvertisement received files:', files);
    
    if (files && Array.isArray(files) && files.length > 0) {
      console.log('✅ Setting uploaded image to:', files[0]);
      setUploadedImage(files[0]); // Take the first uploaded file
    } else if (files && !Array.isArray(files)) {
      console.log('✅ Setting uploaded image (non-array) to:', files);
      setUploadedImage(files); // files is a single object
    } else {
      console.log('⚠️ Invalid files received:', files);
    }
  };



  const handleCostChange = (estimate) => {
    setCostEstimate(estimate);
    if (onCostChange) {
      onCostChange(estimate);
    }
  };

  const onSubmit = async (data) => {
    console.log('🚀 Submit clicked! uploadedImage state:', uploadedImage);
    console.log('🚀 Form data:', data);
    
    if (!uploadedImage) {
      console.error('❌ uploadedImage is null/undefined');
      toast.error('Please upload an image');
      return;
    }

    // Validate advertisement data
    const validationErrors = validateAdvertisementData(data, 'photo');
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsUploading(true);
    try {
      const advertisementData = {
        title: data.title.trim(),
        type: 'photo',
        placement: {
          category: placement,
          position: getPositionFromCategory(placement)
        },
        content: {
          mediaUrl: uploadedImage.url,
          mediaType: 'image'
        },
        schedule: {
          startDate: new Date(data.startDate),
          duration: parseInt(data.duration),
          endDate: new Date(new Date(data.startDate).getTime() + parseInt(data.duration) * 24 * 60 * 60 * 1000)
        },
        pricing: {
          baseRate: costEstimate?.pricing?.baseRate || 0,
          totalCost: costEstimate?.pricing?.totalCost || 0,
          currency: 'USD'
        },
        targeting: {
          devices: data.devices ? data.devices.split(',').map(d => d.trim()) : [],
          locations: data.locations ? data.locations.split(',').map(l => l.trim()) : [],
          userTypes: data.userTypes ? data.userTypes.split(',').map(u => u.trim()) : []
        }
      };

      const response = await advertisementAPI.create(advertisementData);
      
      if (response.success) {
        toast.success('Photo advertisement created successfully!');
        
        // Reset form
        reset();
        setUploadedImage(null);
        setCostEstimate(null);
      } else {
        throw new Error(response.message || 'Failed to create advertisement');
      }
    } catch (error) {
      console.error('Error creating photo advertisement:', error);
      toast.error(error.response?.data?.message || error.message || 'Error creating advertisement');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="photo-advertisement">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🖼️</div>
          <h2 className="text-xl font-semibold text-gray-900">Create Photo Advertisement</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertisement Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                  })}
                  placeholder="Enter advertisement title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  {...register('duration', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 365, message: 'Maximum 365 days' }
                  })}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value);
                    if (!isNaN(duration) && duration > 0) {
                      handleCostChange({ 
                        pricing: { 
                          baseRate: 50, 
                          totalCost: 50 * duration 
                        } 
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
            </div>

            {/* Start Date with Calendar Modal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date * 
                <span className="text-xs text-gray-500 ml-2">
                  (Click to view availability calendar)
                </span>
              </label>
              
              {/* Date Input Button */}
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={selectedStartDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {selectedStartDate 
                      ? new Date(selectedStartDate).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'Select start date from calendar'
                    }
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </button>
              
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
              
              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register('startDate', { 
                  required: 'Start date is required'
                })}
              />

              {/* Calendar Modal */}
              {showCalendar && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowCalendar(false)}
                >
                  <div 
                    className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Select Start Date</h3>
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <DatePickerWithAvailability
                        placement={placement}
                        selectedDate={selectedStartDate}
                        onDateSelect={(date) => {
                          setSelectedStartDate(date);
                          setValue('startDate', formatDateKey(date));
                          setShowCalendar(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Devices (optional)
                </label>
                <input
                  {...register('devices')}
                  placeholder="mobile, desktop, tablet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated values</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Locations (optional)
                </label>
                <input
                  {...register('locations')}
                  placeholder="US, UK, Canada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated values</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target User Types (optional)
                </label>
                <input
                  {...register('userTypes')}
                  placeholder="premium, basic, new"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated values</p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Image Upload</h3>
            
            <MediaUploader
              type="image"
              onUpload={handleImageUpload}
              placement={placement}
              multiple={false}
              className="w-full"
            />

            {uploadedImage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-2">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Image uploaded successfully
                      </p>
                      <p className="text-xs text-green-700">
                        {uploadedImage.originalName} ({uploadedImage.formattedSize})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cost Calculator */}
          {watchedDuration && (
            <CostCalculator
              placement={placement}
              duration={watchedDuration}
              type="photo"
              onCostChange={handleCostChange}
              uploadedFiles={uploadedImage ? [uploadedImage] : []}
            />
          )}

              {/* Preview */}
              {uploadedImage && watchedTitle && (
                <AdvertisementPreview
                  type="photo"
                  mediaUrl={uploadedImage.url}
                  title={watchedTitle}
                  showTitle={true}
                />
              )}
              

          {/* Form Status */}
          {(!uploadedImage || !actualTitle || !actualDuration) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3 mt-0.5">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Complete the form to create advertisement</h4>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    {!uploadedImage && <li>• Upload an image</li>}
                    {!actualTitle && <li>• Enter advertisement title</li>}
                    {!actualDuration && <li>• Set duration (days)</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {uploadedImage && actualTitle && actualDuration ? (
                <span className="text-green-600">✅ Ready to create advertisement</span>
              ) : (
                <span>Fill all required fields to enable submission</span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setUploadedImage(null);
                  setCostEstimate(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isUploading || !uploadedImage}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !uploadedImage ? 'Please upload an image first' :
                  isUploading ? 'Creating advertisement...' :
                  'Create photo advertisement'
                }
              >
                {isUploading ? 'Creating...' : 'Create Photo Advertisement'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoAdvertisement;
