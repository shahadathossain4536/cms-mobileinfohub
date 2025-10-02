import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import MediaUploader from '../components/MediaUploader';
import AdvertisementPreview from '../components/AdvertisementPreview';
import CostCalculator from '../components/CostCalculator';
import DatePickerWithAvailability from '../components/DatePickerWithAvailability';
import { advertisementAPI, getPositionFromCategory, validateAdvertisementData } from '../utils/advertisementUtils';

const MixedMediaSlider = ({ placement, onCostChange }) => {
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm();
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [costEstimate, setCostEstimate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Format date to YYYY-MM-DD
  const formatDateKey = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
  };

  const watchedTitle = watch('title');
  const watchedDuration = watch('duration');

  const handleMediaUpload = (files) => {
    if (files && files.length > 0) {
      setUploadedMedia(prev => [...prev, ...files]);
    }
  };

  const handleCostChange = (estimate) => {
    setCostEstimate(estimate);
    if (onCostChange) {
      onCostChange(estimate);
    }
  };

  const removeMedia = (index) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const reorderMedia = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= uploadedMedia.length) return;
    
    const newMedia = [...uploadedMedia];
    const [removed] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, removed);
    setUploadedMedia(newMedia);
  };

  const onSubmit = async (data) => {
    if (uploadedMedia.length === 0) {
      toast.error('Please upload at least one media file');
      return;
    }

    // Validate advertisement data
    const validationErrors = validateAdvertisementData(data, 'slider');
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsUploading(true);
    try {
      const slides = uploadedMedia.map((media, index) => ({
        mediaUrl: media.url,
        mediaType: media.type,
        title: data[`slideTitle${index}`] || media.originalName,
        description: data[`slideDescription${index}`] || '',
        linkUrl: data[`slideLink${index}`] || '',
        order: index + 1,
        filename: media.filename,
        fileSize: media.size
      }));

      const advertisementData = {
        title: data.title?.trim() || `Advertisement ${Date.now()}`,
        type: 'slider',
        placement: {
          category: placement,
          position: getPositionFromCategory(placement)
        },
        content: {
          slides: slides
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
        toast.success('Mixed media slider created successfully!');
        
        // Reset form
        reset();
        setUploadedMedia([]);
        setCostEstimate(null);
      } else {
        throw new Error(response.message || 'Failed to create advertisement');
      }
    } catch (error) {
      console.error('Error creating mixed media slider:', error);
      toast.error(error.message || 'Error creating advertisement');
    } finally {
      setIsUploading(false);
    }
  };

  const clearAllMedia = () => {
    setUploadedMedia([]);
  };

  return (
    <div className="mixed-media-slider">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🎞️</div>
          <h2 className="text-xl font-semibold text-gray-900">Create Mixed Media Slider</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertisement Title
                </label>
                <input
                  {...register('title', { 
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                  })}
                  placeholder="Enter advertisement title (optional)"
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
                    if (e.target.value && watchedDuration !== e.target.value) {
                      // Trigger cost calculation
                      setTimeout(() => {
                        if (watchedDuration) {
                          handleCostChange({ 
                            pricing: { 
                              baseRate: 100, // Slider typically costs more than single media
                              totalCost: 100 * parseInt(watchedDuration) 
                            } 
                          });
                        }
                      }, 100);
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

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Media Upload</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-3 mt-0.5">💡</div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Mixed Media Slider Requirements</h4>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Upload up to 10 files (images and videos)</li>
                    <li>• Images: JPG, PNG, GIF, WebP (max 50MB each)</li>
                    <li>• Videos: MP4, AVI, MOV, WMV, WebM (max 50MB each)</li>
                    <li>• Recommended: 3-6 slides for optimal engagement</li>
                    <li>• You can reorder slides after upload</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <MediaUploader
              type="mixed"
              onUpload={handleMediaUpload}
              placement={placement}
              multiple={true}
              maxFiles={10}
              className="w-full"
            />

            {uploadedMedia.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-2">✅</div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {uploadedMedia.length} file{uploadedMedia.length > 1 ? 's' : ''} uploaded
                      </p>
                      <p className="text-xs text-green-700">
                        Total size: {uploadedMedia.reduce((sum, file) => sum + file.size, 0).toLocaleString()} bytes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllMedia}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Media Management */}
          {uploadedMedia.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Slide Management</h3>
              
              <div className="space-y-4">
                {uploadedMedia.map((media, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Media Preview */}
                      <div className="lg:col-span-1">
                        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <div className="text-2xl mb-1">🎥</div>
                                <div className="text-xs">Video</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Slide {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Slide Details */}
                      <div className="lg:col-span-2 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slide Title
                          </label>
                          <input
                            {...register(`slideTitle${index}`)}
                            placeholder={media.originalName}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            {...register(`slideDescription${index}`)}
                            placeholder="Enter slide description"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link URL (optional)
                          </label>
                          <input
                            {...register(`slideLink${index}`)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => reorderMedia(index, index - 1)}
                          disabled={index === 0}
                          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Move Up
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => reorderMedia(index, index + 1)}
                          disabled={index === uploadedMedia.length - 1}
                          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Move Down
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Calculator */}
          {watchedDuration && (
            <CostCalculator
              placement={placement}
              duration={watchedDuration}
              type="slider"
              onCostChange={handleCostChange}
              uploadedFiles={uploadedMedia}
            />
          )}

          {/* Preview */}
          {uploadedMedia.length > 0 && watchedTitle && (
            <AdvertisementPreview
              type="slider"
              title={watchedTitle}
              slides={uploadedMedia.map((media, index) => ({
                mediaUrl: media.url,
                mediaType: media.type,
                title: watch(`slideTitle${index}`) || media.originalName,
                description: watch(`slideDescription${index}`) || '',
                linkUrl: watch(`slideLink${index}`) || ''
              }))}
              showTitle={true}
            />
          )}

          {/* Form Status */}
          {(uploadedMedia.length === 0 || !watchedDuration) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3 mt-0.5">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Complete the form to create advertisement</h4>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    {uploadedMedia.length === 0 && <li>• Upload at least one media file</li>}
                    {!watchedDuration && <li>• Set duration (days)</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {uploadedMedia.length > 0 && watchedDuration ? (
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
                  setUploadedMedia([]);
                  setCostEstimate(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isUploading || uploadedMedia.length === 0 || !watchedDuration}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  uploadedMedia.length === 0 ? 'Please upload at least one media file' :
                  !watchedDuration ? 'Please enter duration' :
                  'Ready to create advertisement'
                }
              >
                {isUploading ? 'Creating...' : 'Create Mixed Media Slider'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MixedMediaSlider;
