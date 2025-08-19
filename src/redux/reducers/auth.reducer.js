import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_FAILURE, LOGOUT_REQUEST, LOGOUT_SUCCESS } from '../actionTypes/actionTypes';

const initState = {
  token: null,
  user: {
    firstName: "",
    lastName: "",
    email: "",
    picture: "",
  },
  authenticate: false,
  authenticating: false,
  loading: false,
  error: null,
  message: "",
};

const authReducer = (state = initState, action) => {
  console.log('Auth reducer action:', action);
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        authenticating: true,
        error: null, // Clear previous errors
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authenticate: true,
        authenticating: false,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        authenticate: false,
        authenticating: false,
        error: action.payload?.error || 'Login failed',
        token: null,
        user: initState.user,
      };
    case LOGOUT_REQUEST:
      return {
        ...initState,
        loading: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...initState,
      };
    case LOGOUT_FAILURE:
      return {
        ...state,
        error: action.payload?.error || 'Logout failed',
        loading: false,
      };
    default:
      return state;
  }
};

export default authReducer;
