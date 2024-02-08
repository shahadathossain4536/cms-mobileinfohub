
import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT_SUCCESS } from '../actionTypes/actionTypes';
import axios from '../../helpers/axios';

export const login = (user) => {
  console.log(user);
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    const res = await axios.post("/admin/signin", {
      ...user,
    });

    if (res.status === 200) {
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token,
          user,
        },
      });
    } else {
      if (res.status === 400) {
        dispatch({
          type: LOGIN_FAILURE,
          payload: { error: res.data.error },
        });
      }
    }

    // dispatch({
    //   type: LOGIN_REQUEST,
    //   payload: {
    //     ...user,
    //   },
    // });.
  };
};

export const isUserLoggedIn = () => {
  return async (dispatch) => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user"));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token,
          user,
        },
      });
    } else {
      dispatch({
        type: LOGIN_FAILURE,
        payload: { error: "Failed to login" },
      });
    }
  };
};

export const signout = () => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    const res = await axios.post("/admin/signout");
    if (res.status === 200) {
      localStorage.clear();
      dispatch({
        type: LOGOUT_SUCCESS,
      });
    } else {
      dispatch({
        type: LOGIN_FAILURE,
        payload: { error: res.data.error },
      });
    }
  };
};
