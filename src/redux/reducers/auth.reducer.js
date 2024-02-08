import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT_FAILURE, LOGOUT_REQUEST, LOGOUT_SUCCESS } from '../actionTypes/actionTypes';

const initState = {
  token: null,
  user: {
    firstName: "",
    LastName: "",
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
  console.log(action);
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        authenticating: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authenticate: true,
        authenticating: false,
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
        error: action.payload.error,
        loading: false,
      };
    default:
      return state;
  }

};

export default authReducer;
