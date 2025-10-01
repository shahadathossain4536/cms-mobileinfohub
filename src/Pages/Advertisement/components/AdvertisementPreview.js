import React, { useState } from 'react';
import { getFileTypeFromMime } from '../utils/fileUploadUtils';

const AdvertisementPreview = ({ 
  type, 
  mediaUrl, 
  title, 
  slides = [], 
  className = '',
  showTitle = true,
  showControls = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getMediaType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const handleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const renderSingleMedia = () => {
    const mediaType = getMediaType(mediaUrl);
    
    return (
      <div className="preview-container">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt={title || 'Advertisement preview'}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : mediaType === 'video' ? (
          <div className="relative">
            <video
              src={mediaUrl}
              className="w-full h-48 object-cover rounded-lg"
              controls={showControls}
              poster={mediaUrl.replace(/\.[^/.]+$/, '_thumb.jpg')} // Assuming thumbnail naming
            />
            {!showControls && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleVideoPlay}
              >
                <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <div className="w-6 h-6 bg-white rounded"></div>
                  ) : (
                    <div className="w-0 h-0 border-l-8 border-l-white border-y-8 border-y-transparent ml-1"></div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📁</div>
              <p>Preview not available</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSlider = () => {
    if (slides.length === 0) {
      return (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🎞️</div>
            <p>No slides to preview</p>
          </div>
        </div>
      );
    }

    const currentSlideData = slides[currentSlide];

    return (
      <div className="slider-preview">
        <div className="relative">
          {/* Main Slide Display */}
          <div className="w-full h-48 overflow-hidden rounded-lg">
            {currentSlideData.mediaType === 'image' ? (
              <img
                src={currentSlideData.mediaUrl}
                alt={currentSlideData.title || `Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={currentSlideData.mediaUrl}
                className="w-full h-full object-cover"
                controls
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}

          {/* Slide Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Slide Thumbnails */}
        {slides.length > 1 && (
          <div className="flex space-x-2 mt-3 overflow-x-auto">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentSlide 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {slide.mediaType === 'image' ? (
                  <img
                    src={slide.mediaUrl}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-500 text-xs">🎥</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Slide Info */}
        {currentSlideData && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 text-sm">
              {currentSlideData.title || `Slide ${currentSlide + 1}`}
            </h4>
            {currentSlideData.description && (
              <p className="text-xs text-gray-600 mt-1">
                {currentSlideData.description}
              </p>
            )}
            {currentSlideData.linkUrl && (
              <a 
                href={currentSlideData.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
              >
                Visit Link →
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`advertisement-preview ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {showTitle && (
          <div className="flex items-center mb-4">
            <div className="text-lg mr-2">👁️</div>
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          </div>
        )}

        {type === 'slider' ? renderSlider() : renderSingleMedia()}

        {/* Advertisement Info */}
        {title && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 text-sm">
              {title}
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Type: {type.charAt(0).toUpperCase() + type.slice(1)} Advertisement
            </p>
          </div>
        )}

        {/* Preview Notes */}
        <div className="mt-3 text-xs text-gray-500">
          <p>This is a preview of how your advertisement will appear to users.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPreview;
