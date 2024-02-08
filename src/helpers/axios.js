import axios from "axios";
import { LOGOUT_SUCCESS } from '../redux/actionTypes/actionTypes';
import store from '../redux/store';
import { api } from '../urlConfig';

const token = window.localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: api,
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

axiosInstance.interceptors.request.use((req) => {
  const { auth } = store.getState();
  if (auth.token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log(error.response);
    const { status } = error.response;
    if (status === 500) {
      localStorage.clear();
      store.dispatch({ type: LOGOUT_SUCCESS });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
