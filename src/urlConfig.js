const envApi = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL;
export const api = envApi || "https://deviceinfohub-server.vercel.app/api";
export const generatePublicUrl = (fileName) => {
  const base = (envApi && envApi.replace(/\/api$/, '')) || "https://deviceinfohub-server.vercel.app";
  return `${base}/public/${fileName}`;
};
