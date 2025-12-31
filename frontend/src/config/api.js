// API Configuration
const BASE_API_URL = "http://localhost:8000/";

const API_ENDPOINTS = {
  LOGIN: `${BASE_API_URL}auth/login`,
  LOGOUT: `${BASE_API_URL}auth/logout`,
  REFRESH_TOKEN: `${BASE_API_URL}auth/refresh_token`,
  AUTH_ME: `${BASE_API_URL}auth/me`,
  CHANGE_PASSWORD: `${BASE_API_URL}auth/reset_password`,

  CREATE_USER: `${BASE_API_URL}employee/create_employee`,
  DELETE_USER: `${BASE_API_URL}employee/delete_employee`,
  GET_ALL_USERS: `${BASE_API_URL}employee/employees`,
  GET_STANDARD_USERS: `${BASE_API_URL}employee/standard_employees`,

  MENU_DASHBOARD: `${BASE_API_URL}menu/dashboard`,

  LIST_NOTIFICATIONS: `${BASE_API_URL}notification/notifications`,
  COUNT_NOTIFICATIONS: `${BASE_API_URL}notification/count_notifications`,
  CREATE_NOTIFICATION: `${BASE_API_URL}notification/create_notification`,
  LIST_USER_NOTIFICATIONS: `${BASE_API_URL}notification/user_notifications`,
  RESOLVE_NOTIFICATION: `${BASE_API_URL}notification/resolve_notification`,

  STOCK_CGCEL_UPLOAD: `${BASE_API_URL}stock_cgcel/upload`,
  STOCK_CGCEL_ENQUIRY: `${BASE_API_URL}stock_cgcel/enquiry`,
  STOCK_CGCEL_LIST: `${BASE_API_URL}stock_cgcel/spare_list`,
  STOCK_CGCEL_LIST_BY_DIVISION: `${BASE_API_URL}stock_cgcel/spare_list_by_division`, // append division param
  STOCK_CGCEL_SEARCH_CODE: `${BASE_API_URL}stock_cgcel/by_code`,
  STOCK_CGCEL_SEARCH_NAME: `${BASE_API_URL}stock_cgcel/by_name`,
  STOCK_CGCEL_CREATE_INDENT: `${BASE_API_URL}stock_cgcel/create_indent`,
  STOCK_CGCEL_UPDATE: `${BASE_API_URL}stock_cgcel/update`,
  STOCK_CGCEL_PENDING_INDENT: `${BASE_API_URL}stock_cgcel/indent_details`, //append division param
  STOCK_CGCEL_NEXT_INDENT_CODE: `${BASE_API_URL}stock_cgcel/next_indent_code`,
  STOCK_CGCEL_GENERATE_INDENT: `${BASE_API_URL}stock_cgcel/generate_indent`,
  STOCK_CGCEL_INDENT_ENQUIRY: `${BASE_API_URL}stock_cgcel/indent_enquiry`, // append indent_number param

  STOCK_CGPISL_UPLOAD: `${BASE_API_URL}stock_cgpisl/upload`,
  STOCK_CGPISL_ENQUIRY: `${BASE_API_URL}stock_cgpisl/enquiry`,
  STOCK_CGPISL_LIST: `${BASE_API_URL}stock_cgpisl/spare_list`,
  STOCK_CGPISL_LIST_BY_DIVISION: `${BASE_API_URL}stock_cgpisl/spare_list_by_division`, // append division param
  STOCK_CGPISL_SEARCH_CODE: `${BASE_API_URL}stock_cgpisl/by_code`,
  STOCK_CGPISL_SEARCH_NAME: `${BASE_API_URL}stock_cgpisl/by_name`,
  STOCK_CGPISL_CREATE_INDENT: `${BASE_API_URL}stock_cgpisl/create_indent`,
  STOCK_CGPISL_PENDING_INDENT: `${BASE_API_URL}stock_cgpisl/indent_details`, //append division param
  STOCK_CGPISL_NEXT_INDENT_CODE: `${BASE_API_URL}stock_cgpisl/next_indent_code`,
  STOCK_CGPISL_GENERATE_INDENT: `${BASE_API_URL}stock_cgpisl/generate_indent`,
  STOCK_CGPISL_INDENT_ENQUIRY: `${BASE_API_URL}stock_cgpisl/indent_enquiry`, // append indent_number param

  GRC_CGCEL_UPLOAD: `${BASE_API_URL}grc_cgcel/upload`,
  GRC_CGCEL_NOT_RECEIVED_NUMBERS: `${BASE_API_URL}grc_cgcel/not_received_grc`,
  GRC_CGCEL_NOT_RECEIVED_BY_GRC_NUMBER: `${BASE_API_URL}grc_cgcel/not_received_by_grc_number`,
  GRC_CGCEL_UPDATE_RECEIVE: `${BASE_API_URL}grc_cgcel/update_receive`,
  GRC_CGCEL_NEXT_CHALLAN_CODE: `${BASE_API_URL}grc_cgcel/next_challan_code`,
  GRC_CGCEL_LIST_BY_DIVISION: `${BASE_API_URL}grc_cgcel/grc_return_by_division`, // append division param
  GRC_CGCEL_SAVE_RETURN: `${BASE_API_URL}grc_cgcel/save_grc_return`,
  GRC_CGCEL_FINALIZE_RETURN: `${BASE_API_URL}grc_cgcel/finalize_grc_return`,
  GRC_CGCEL_REPORT_PRINT: `${BASE_API_URL}grc_cgcel/print_report`,
  GRC_CGPISL_ENQUIRY: `${BASE_API_URL}grc_cgpisl/enquiry`,


  GRC_CGPISL_UPLOAD: `${BASE_API_URL}grc_cgpisl/upload`,

  COMPLAINT_UPLOAD: `${BASE_API_URL}complaint/upload`,
};

export default API_ENDPOINTS;
