const envApi = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL;
export const api = envApi || "https://api.mobileinfohub.com/api";
export const generatePublicUrl = (fileName) => {
  const base = (envApi && envApi.replace(/\/api$/, '')) || "https://api.mobileinfohub.com";
  return `${base}/public/${fileName}`;
};
