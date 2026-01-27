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
  GRC_CGCEL_ENQUIRY: `${BASE_API_URL}grc_cgcel/enquiry`,

  GRC_CGPISL_UPLOAD: `${BASE_API_URL}grc_cgpisl/upload`,
  GRC_CGPISL_NOT_RECEIVED_NUMBERS: `${BASE_API_URL}grc_cgpisl/not_received_grc`,
  GRC_CGPISL_NOT_RECEIVED_BY_GRC_NUMBER: `${BASE_API_URL}grc_cgpisl/not_received_by_grc_number`,
  GRC_CGPISL_UPDATE_RECEIVE: `${BASE_API_URL}grc_cgpisl/update_receive`,
  GRC_CGPISL_NEXT_CHALLAN_CODE: `${BASE_API_URL}grc_cgpisl/next_challan_code`,
  GRC_CGPISL_LIST_BY_DIVISION: `${BASE_API_URL}grc_cgpisl/grc_return_by_division`, // append division param
  GRC_CGPISL_SAVE_RETURN: `${BASE_API_URL}grc_cgpisl/save_grc_return`,
  GRC_CGPISL_FINALIZE_RETURN: `${BASE_API_URL}grc_cgpisl/finalize_grc_return`,
  GRC_CGPISL_REPORT_PRINT: `${BASE_API_URL}grc_cgpisl/print_report`,
  GRC_CGPISL_ENQUIRY: `${BASE_API_URL}grc_cgpisl/enquiry`,

  COMPLAINT_UPLOAD: `${BASE_API_URL}complaints/upload`,
  COMPLAINT_UPLOAD_NEW: `${BASE_API_URL}complaints/upload_new`,
  COMPLAINT_ENQUIRY: `${BASE_API_URL}complaints/enquiry`, //append query params as needed
  COMPLAINT_STATS_ENQUIRY: `${BASE_API_URL}complaints/complaint_stats_enquiry`, //append card name
  COMPLAINT_FILTER_DATA: `${BASE_API_URL}complaints/complaint_filter_data`,
  COMPLAINT_EMPLOYEES: `${BASE_API_URL}complaints/employees`,
  COMPLAINT_ALLOCATION_DATA: `${BASE_API_URL}complaints/complaint_allocation_data`, //append allocated_to param
  COMPLAINT_REALLOCATE: `${BASE_API_URL}complaints/reallocate_complaints`,
  COMPLAINT_CREATE: `${BASE_API_URL}complaints/create`,
  COMPLAINT_CREATE_DATA: `${BASE_API_URL}complaints/complaint_create_data`,
  COMPLAINT_UPDATE_DATA: `${BASE_API_URL}complaints/complaint_update_data`,
  COMPLAINT_SEARCH_NUMBER: `${BASE_API_URL}complaints/by_complaint_number`,
  COMPLAINT_UPDATE: `${BASE_API_URL}complaints/update`, //append complaint number
  COMPLAINT_MAIL_TECHNICIAN: `${BASE_API_URL}complaints/mail_technician_list`,
  COMPLAINT_SEND_EMAIL: `${BASE_API_URL}complaints/send_email`,
  COMPLAINT_ALL_COMPLAINTS: `${BASE_API_URL}complaints/all_complaints`,
  COMPLAINT_MAIL_SENT_TO_HO: `${BASE_API_URL}complaints/mail_sent_to_ho`,
  COMPLAINT_SEARCH_NUMBER_RFR: `${BASE_API_URL}complaints/by_complaint_number_rfr`, //append complaint number
  COMPLAINT_RFR_CREATE: `${BASE_API_URL}complaints/create_rfr`,
  COMPLAINT_NEXT_RFR_NUMBER: `${BASE_API_URL}complaints/next_rfr_number`,
  COMPLAINT_GENERATE_RFR_DATA: `${BASE_API_URL}complaints/generate_rfr_data`, //append division
  COMPLAINT_GENERATE_RFR: `${BASE_API_URL}complaints/rfr_report`,

  CUSTOMER_CREATE: `${BASE_API_URL}customer/create`,
  CUSTOMER_NEXT_CODE: `${BASE_API_URL}customer/next_code`,
  CUSTOMER_LIST_NAMES: `${BASE_API_URL}customer/list_names`,
  CUSTOMER_UPDATE: `${BASE_API_URL}customer/update/`, //append code
  CUSTOMER_SEARCH_CODE: `${BASE_API_URL}customer/by_code`,
  CUSTOMER_SEARCH_NAME: `${BASE_API_URL}customer/by_name`,
  CUSTOMER_SEARCH_NAME_FOR_COMPLAINT: `${BASE_API_URL}customer/by_name_for_complaint`, //append complaint number

  PARAMETER_LIST: `${BASE_API_URL}parameter/parameters`,
  PARAMETER_UPDATE: `${BASE_API_URL}parameter/update`,
};

export default API_ENDPOINTS;
