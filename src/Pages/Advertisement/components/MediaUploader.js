import React, { useState, useRef } from 'react';
import { uploadWithProgress, validateFiles, formatFileSize, getFileTypeFromMime } from '../utils/fileUploadUtils';
import toast from 'react-hot-toast';

const MediaUploader = ({ 
  type = 'image', 
  onUpload, 
  placement, 
  multiple = false,
  maxFiles = 5,
  disabled = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const getAcceptTypes = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'mixed':
        return 'image/*,video/*';
      default:
        return '*';
    }
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'image':
        return 'Click to upload image';
      case 'video':
        return 'Click to upload video';
      case 'mixed':
        return 'Click to upload images and videos';
      default:
        return 'Click to upload files';
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validate files
    const errors = validateFiles(files, type, maxFiles);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Generate previews
    const filePreviews = await Promise.all(
      files.map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          previewUrl,
          name: file.name,
          size: file.size,
          type: getFileTypeFromMime(file.type),
          formattedSize: formatFileSize(file.size)
        };
      })
    );

    setSelectedFiles(files);
    setPreviews(filePreviews);

    // Upload files
    await handleUpload(files);
  };

  const handleUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadWithProgress(files, type, placement, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Upload result:', result);

      if (result.success) {
        toast.success(`${files.length} file(s) uploaded successfully!`);
        
        // Call parent callback with uploaded files
        if (onUpload) {
          // For single image upload, create array with single file object
          let filesToPass;
          if (result.data && result.data.files) {
            console.log('📦 Multiple files (slider/mixed):', result.data.files);
            filesToPass = result.data.files;
          } else if (result.data) {
            // Single file response - wrap in array
            console.log('📦 Single file:', result.data);
            filesToPass = [result.data];
          } else {
            console.log('📦 Fallback:', result);
            filesToPass = [result];
          }
          
          console.log('📤 Passing to parent:', filesToPass);
          onUpload(filesToPass);
        }

        // Clear selections but keep previews for a moment
        setSelectedFiles([]);
        // Don't clear previews immediately - let parent handle it
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePreview = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...selectedFiles];
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(newPreviews[index].previewUrl);
    
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setPreviews(newPreviews);
    setSelectedFiles(newFiles);
  };

  const clearAll = () => {
    // Revoke all object URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.previewUrl));
    
    setPreviews([]);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`media-uploader ${className}`}>
      {/* Upload Area */}
      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={isUploading || disabled}
          className="file-input"
          style={{ display: 'none' }}
        />
        
        <div 
          className="upload-placeholder"
          onClick={() => !isUploading && !disabled && fileInputRef.current?.click()}
          style={{
            cursor: isUploading || disabled ? 'not-allowed' : 'pointer',
            opacity: isUploading || disabled ? 0.6 : 1
          }}
        >
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-bar bg-gray-200 rounded-full h-2 w-full">
                <div 
                  className="progress-fill bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="upload-content text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="upload-icon text-4xl mb-4">
                {type === 'image' ? '🖼️' : type === 'video' ? '🎥' : '📁'}
              </div>
              <p className="text-lg font-medium text-gray-700">
                {getPlaceholderText()}
              </p>
              {multiple && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum {maxFiles} files
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {type === 'image' ? 'JPG, PNG, GIF, WebP' : 
                 type === 'video' ? 'MP4, AVI, MOV, WMV, WebM' : 
                 'Images and Videos supported'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="file-previews mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({previews.length})
            </h4>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800"
              disabled={isUploading}
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="file-preview-card border rounded-lg p-3">
                <div className="preview-container mb-2">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.previewUrl}
                      alt={preview.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎥</div>
                        <div className="text-xs text-gray-500">Video</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="file-info">
                  <p className="text-sm font-medium text-gray-900 truncate" title={preview.name}>
                    {preview.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preview.formattedSize} • {preview.type}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                  disabled={isUploading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="upload-actions mt-4">
          <button
            type="button"
            onClick={() => handleUpload(selectedFiles)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
