
import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT_SUCCESS } from '../actionTypes/actionTypes';
import axios from '../../helpers/axios';

export const login = (user) => {
  console.log('Login attempt with:', user);
  return async (dispatch) => {
    try {
      dispatch({ type: LOGIN_REQUEST });
      
      const res = await axios.post("/admin/signin", user);
      console.log('Login response:', res);

      if (res.status === 200) {
        const { token, user } = res.data;
        
        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Dispatch success
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            user,
          },
        });
        
        console.log('Login successful, user data stored');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Invalid credentials';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.error || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      dispatch({
        type: LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
    }
  };
};

export const isUserLoggedIn = () => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          dispatch({
            type: LOGIN_SUCCESS,
            payload: {
              token,
              user,
            },
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking login status:', error);
      // Clear invalid data
      localStorage.clear();
      return false;
    }
  };
};

export const signout = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: LOGIN_REQUEST });
      const res = await axios.post("/admin/signout");
      
      if (res.status === 200) {
        localStorage.clear();
        dispatch({
          type: LOGOUT_SUCCESS,
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
      // Even if server call fails, clear local data
      localStorage.clear();
      dispatch({
        type: LOGOUT_SUCCESS,
      });
    }
  };
};
