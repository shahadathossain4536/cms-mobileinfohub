// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_CONFIG = {
  // Local development server
  LOCAL_API_URL: 'http://localhost:2000/api',
  
  // Production server
  PRODUCTION_API_URL: 'https://deviceinfohub-server.vercel.app/api',
  
  // Get current API URL
  getCurrentApiUrl: () => {
    return isDevelopment 
      ? API_CONFIG.LOCAL_API_URL 
      : API_CONFIG.PRODUCTION_API_URL;
  },
  
  // Check if running locally
  isLocalDevelopment: () => {
    return isDevelopment;
  }
};

export default API_CONFIG;
