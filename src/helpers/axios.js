import axios from "axios";
import { LOGOUT_SUCCESS } from '../redux/actionTypes/actionTypes';
import store from '../redux/store';
import { api } from '../urlConfig';

const axiosInstance = axios.create({
  baseURL: api,
});

// Ensure the freshest token is always sent
axiosInstance.interceptors.request.use((requestConfig) => {
  try {
    const state = store.getState?.();
    const tokenFromStore = state?.auth?.token;
    const tokenFromStorage = window.localStorage.getItem("token");
    const effectiveToken = tokenFromStore || tokenFromStorage;
    if (effectiveToken) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers.Authorization = `Bearer ${effectiveToken}`;
    }
  } catch (_) {
    // no-op
  }
  return requestConfig;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        window.localStorage.clear();
        store.dispatch?.({ type: LOGOUT_SUCCESS });
      } catch (_) {
        // no-op
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
