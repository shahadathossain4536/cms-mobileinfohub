// File upload utility functions
import axios from '../../../helpers/axios';
import toast from 'react-hot-toast';

// Development configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const LOCAL_API_URL = 'http://localhost:2000/api';
const PRODUCTION_API_URL = 'https://api.mobileinfohub.com/api';

// Get the correct API URL based on environment
const getApiUrl = () => {
  if (isDevelopment) {
    return LOCAL_API_URL;
  }
  return PRODUCTION_API_URL;
};

// File validation
export const validateFile = (file, type = 'image') => {
  const errors = [];
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    errors.push(`File size cannot exceed ${formatFileSize(maxSize)}`);
  }
  
  // Check file type
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    mixed: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
  };
  
  const allowedMimeTypes = allowedTypes[type] || allowedTypes.mixed;
  if (!allowedMimeTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }
  
  return errors;
};

// Validate multiple files
export const validateFiles = (files, type = 'mixed', maxFiles = 10) => {
  const errors = [];
  
  if (files.length === 0) {
    errors.push('Please select at least one file');
    return errors;
  }
  
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }
  
  files.forEach((file, index) => {
    const fileErrors = validateFile(file, type);
    fileErrors.forEach(error => {
      errors.push(`File ${index + 1}: ${error}`);
    });
  });
  
  return errors;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type from MIME type
export const getFileTypeFromMime = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'unknown';
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Generate preview URL for file
export const generatePreviewUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload single image
export const uploadImage = async (file, placement) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('placement', placement);
    
    const apiUrl = getApiUrl();
    console.log('Uploading to:', `${apiUrl}/uploads/image`);
    
    const response = await axios.post(`${apiUrl}/uploads/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      }
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Image upload error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

// Upload single video
export const uploadVideo = async (file, placement) => {
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('placement', placement);
    
    const apiUrl = getApiUrl();
    console.log('Uploading to:', `${apiUrl}/uploads/video`);
    
    const response = await axios.post(`${apiUrl}/uploads/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      }
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Video upload error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

// Upload mixed media (images and videos)
export const uploadMixedMedia = async (files, placement) => {
  try {
    const formData = new FormData();
    
    // Separate images and videos
    const images = files.filter(file => file.type.startsWith('image/'));
    const videos = files.filter(file => file.type.startsWith('video/'));
    
    // Add images to form data
    images.forEach(file => {
      formData.append('images', file);
    });
    
    // Add videos to form data
    videos.forEach(file => {
      formData.append('videos', file);
    });
    
    formData.append('placement', placement);
    
    const apiUrl = getApiUrl();
    console.log('Uploading to:', `${apiUrl}/uploads/mixed-media`);
    console.log('Files to upload:', { images: images.length, videos: videos.length });
    
    const response = await axios.post(`${apiUrl}/uploads/mixed-media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      }
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Mixed media upload error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

// Upload files based on type
export const uploadFiles = async (files, type, placement) => {
  // Validate files first
  const errors = validateFiles(files, type);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  
  switch (type) {
    case 'image':
      if (files.length > 1) {
        throw new Error('Only one image file allowed');
      }
      return await uploadImage(files[0], placement);
      
    case 'video':
      if (files.length > 1) {
        throw new Error('Only one video file allowed');
      }
      return await uploadVideo(files[0], placement);
      
    case 'mixed':
      return await uploadMixedMedia(files, placement);
      
    default:
      throw new Error(`Invalid upload type: ${type}`);
  }
};

// Delete uploaded file
export const deleteFile = async (filename) => {
  try {
    const response = await axios.delete('/api/uploads/delete', {
      data: { filename }
    });
    return response.data;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Get file info
export const getFileInfo = async (filepath) => {
  try {
    const response = await axios.get(`/api/uploads/info/${filepath}`);
    return response.data;
  } catch (error) {
    console.error('File info error:', error);
    throw error;
  }
};

// List uploaded files
export const listUploadedFiles = async (type = null, placement = null) => {
  try {
    const params = {};
    if (type) params.type = type;
    if (placement) params.placement = placement;
    
    const response = await axios.get('/api/uploads/list', { params });
    return response.data;
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
};

// File upload with progress tracking
export const uploadWithProgress = async (files, type, placement, onProgress) => {
  try {
    // Validate files
    const errors = validateFiles(files, type);
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    
    // Upload files
    const result = await uploadFiles(files, type, placement);
    
    if (result.success) {
      toast.success(`${files.length} file(s) uploaded successfully!`);
      return result;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.message || 'Upload failed');
    throw error;
  }
};

// Create file preview object
export const createFilePreview = (file, previewUrl) => {
  return {
    file,
    previewUrl,
    name: file.name,
    size: file.size,
    type: getFileTypeFromMime(file.type),
    extension: getFileExtension(file.name),
    formattedSize: formatFileSize(file.size)
  };
};

// Batch upload files with individual progress
export const batchUploadFiles = async (files, type, placement, onFileProgress) => {
  const results = [];
  const errors = [];
  
  try {
    // Validate all files first
    const validationErrors = validateFiles(files, type);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }
    
    // Upload files one by one for better progress tracking
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const result = await uploadFiles([file], type, placement);
        results.push(result.data);
        
        if (onFileProgress) {
          onFileProgress(i + 1, files.length, file.name);
        }
      } catch (error) {
        errors.push({ file: files[i].name, error: error.message });
      }
    }
    
    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }
    
    return {
      success: true,
      results,
      errors,
      totalFiles: files.length,
      successfulUploads: results.length,
      failedUploads: errors.length
    };
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
};
