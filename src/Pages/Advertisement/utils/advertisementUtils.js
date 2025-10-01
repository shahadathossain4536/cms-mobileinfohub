// Advertisement utility functions
import axios from '../../../helpers/axios';

// Development configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const LOCAL_API_URL = 'http://localhost:2000/api';
const PRODUCTION_API_URL = 'https://deviceinfohub-server.vercel.app/api';

// Get the correct API URL based on environment
const getApiUrl = () => {
  if (isDevelopment) {
    return LOCAL_API_URL;
  }
  return PRODUCTION_API_URL;
};

// Convert advertisement category to position
export const getPositionFromCategory = (category) => {
  const positionMap = {
    'ads_top_banner': 'top',
    'ads_left_side_one_banner': 'left_side_one',
    'ads_left_side_two_banner': 'left_side_two',
    'ads_web_site_on_load': 'on_load'
  };
  return positionMap[category] || 'top';
};

// Get category display name
export const getCategoryDisplayName = (category) => {
  const displayNames = {
    'ads_top_banner': 'Top Banner',
    'ads_left_side_one_banner': 'Left Side Banner 1',
    'ads_left_side_two_banner': 'Left Side Banner 2',
    'ads_web_site_on_load': 'Website On Load'
  };
  return displayNames[category] || category;
};

// Validate advertisement data
export const validateAdvertisementData = (data, type) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Advertisement title is required');
  }

  if (!data.duration || data.duration < 1) {
    errors.push('Duration must be at least 1 day');
  }

  if (data.duration > 365) {
    errors.push('Duration cannot exceed 365 days');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  // Type-specific validation
  // Note: Media upload validation (mediaUrl, slides) is handled in the component
  // because the uploaded files are in component state, not in form data
  switch (type) {
    case 'photo':
      // Media validation handled in PhotoAdvertisement component
      break;
    case 'video':
      // Media validation handled in VideoAdvertisement component
      break;
    case 'slider':
      // Media validation handled in MixedMediaSlider component
      break;
  }

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

// Get file type from URL or filename
export const getFileType = (url) => {
  if (!url) return 'unknown';
  
  const extension = url.split('.').pop().toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  
  return 'unknown';
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status color class
export const getStatusColor = (status) => {
  const statusColors = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'approved': 'text-blue-600 bg-blue-100',
    'active': 'text-green-600 bg-green-100',
    'inactive': 'text-gray-600 bg-gray-100',
    'rejected': 'text-red-600 bg-red-100',
    'expired': 'text-orange-600 bg-orange-100',
    'stopped': 'text-red-600 bg-red-100'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

// Get status display name
export const getStatusDisplayName = (status) => {
  const statusNames = {
    'pending': 'Pending',
    'approved': 'Approved',
    'active': 'Active',
    'inactive': 'Inactive',
    'rejected': 'Rejected',
    'expired': 'Expired',
    'stopped': 'Stopped'
  };
  return statusNames[status] || status;
};

// Calculate days until expiry
export const getDaysUntilExpiry = (endDate) => {
  const now = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if advertisement is expiring soon
export const isExpiringSoon = (endDate, daysThreshold = 7) => {
  const daysLeft = getDaysUntilExpiry(endDate);
  return daysLeft <= daysThreshold && daysLeft > 0;
};

// Generate advertisement preview data
export const generatePreviewData = (advertisement) => {
  return {
    title: advertisement.title || 'Untitled Advertisement',
    type: advertisement.type,
    placement: getCategoryDisplayName(advertisement.placement?.category),
    status: getStatusDisplayName(advertisement.status),
    statusColor: getStatusColor(advertisement.status),
    startDate: formatDate(advertisement.schedule?.startDate),
    endDate: formatDate(advertisement.schedule?.endDate),
    duration: advertisement.schedule?.duration || 0,
    cost: formatCurrency(advertisement.pricing?.totalCost || 0),
    daysLeft: getDaysUntilExpiry(advertisement.schedule?.endDate),
    isExpiringSoon: isExpiringSoon(advertisement.schedule?.endDate)
  };
};

// API helper functions
export const advertisementAPI = {
  // Create advertisement
  create: async (data) => {
    const apiUrl = getApiUrl();
    const response = await axios.post(`${apiUrl}/user/advertisements`, data);
    return response.data;
  },

  // Get running ads count
  getRunningCount: async () => {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/advertisements/public/running-count`);
    return response.data;
  },

  // Check slot availability
  checkSlotAvailability: async (category, position) => {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/advertisement-slots/availability`, {
      params: { category, position }
    });
    return response.data;
  },

  // Calculate cost
  calculateCost: async (category, position, duration, type) => {
    const apiUrl = getApiUrl();
    const response = await axios.post(`${apiUrl}/user/advertisements/calculate-cost`, {
      category,
      position,
      duration,
      type
    });
    return response.data;
  },

  // Get user advertisements
  getUserAds: async () => {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/user/advertisements/my-ads`);
    return response.data;
  },

  // Get user running ads
  getUserRunningAds: async () => {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/user/advertisements/my-ads/running`);
    return response.data;
  },

  // Get user ad stats
  getUserAdStats: async () => {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/user/advertisements/my-ads/stats`);
    return response.data;
  }
};

// Default advertisement tab data
export const advertisementTabData = [
  {
    id: 1,
    title: "Advertisement Top Banner",
    data: "ads_top_banner",
    icon: "fas fa-ad",
    link: "/advertisement",
    description: "Highly visible top banner placement"
  },
  {
    id: 2,
    title: "Ads Left Side One Banner",
    data: "ads_left_side_one_banner",
    icon: "fas fa-ad",
    link: "/advertisement",
    description: "Left sidebar banner placement"
  },
  {
    id: 3,
    title: "Ads Left Side Two Banner",
    data: "ads_left_side_two_banner",
    icon: "fas fa-ad",
    link: "/advertisement",
    description: "Secondary left sidebar placement"
  },
  {
    id: 4,
    title: "Ads Web Site OnLoad",
    data: "ads_web_site_on_load",
    icon: "fas fa-ad",
    link: "/advertisement",
    description: "Popup or overlay on page load"
  }
];

// Advertisement type options
export const advertisementTypes = [
  {
    value: 'photo',
    label: 'Photo Advertisement',
    icon: 'fas fa-image',
    description: 'Single image advertisement'
  },
  {
    value: 'video',
    label: 'Video Advertisement',
    icon: 'fas fa-video',
    description: 'Single video advertisement'
  },
  {
    value: 'slider',
    label: 'Mixed Media Slider',
    icon: 'fas fa-images',
    description: 'Slider with images and videos'
  }
];
