// API Configuration
const BASE_API_URL = "http://localhost:8000/";

const API_ENDPOINTS = {
  LOGIN: `${BASE_API_URL}auth/login`,
  LOGOUT: `${BASE_API_URL}auth/logout`,
  REFRESH_TOKEN: `${BASE_API_URL}auth/refresh_token`,
  AUTH_ME: `${BASE_API_URL}auth/me`,

  CREATE_USER: `${BASE_API_URL}user/create_user`,
  DELETE_USER: `${BASE_API_URL}user/delete_user`,
  CHANGE_PASSWORD: `${BASE_API_URL}user/reset_password`,
  GET_ALL_USERS: `${BASE_API_URL}user/users`,
  GET_STANDARD_USERS: `${BASE_API_URL}user/standard_users`,

};

export default API_ENDPOINTS;
