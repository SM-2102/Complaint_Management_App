// API Configuration
const BASE_API_URL = "http://localhost:8000/";

const API_ENDPOINTS = {
  LOGIN: `${BASE_API_URL}auth/login`,
  LOGOUT: `${BASE_API_URL}auth/logout`,
  REFRESH_TOKEN: `${BASE_API_URL}auth/refresh_token`,
  AUTH_ME: `${BASE_API_URL}auth/me`,

  MENU_DASHBOARD: `${BASE_API_URL}menu/dashboard`,

  CREATE_USER: `${BASE_API_URL}user/create_user`,
  DELETE_USER: `${BASE_API_URL}user/delete_user`,
  CHANGE_PASSWORD: `${BASE_API_URL}user/reset_password`,
  GET_ALL_USERS: `${BASE_API_URL}user/users`,
  GET_STANDARD_USERS: `${BASE_API_URL}user/standard_users`,

  MASTER_CREATE: `${BASE_API_URL}master/create`,
  MASTER_NEXT_CODE: `${BASE_API_URL}master/next_code`,
  MASTER_LIST_NAMES: `${BASE_API_URL}master/list_names`,
  MASTER_UPDATE: `${BASE_API_URL}master/update/`, //append code
  MASTER_SEARCH_CODE: `${BASE_API_URL}master/by_code`,
  MASTER_SEARCH_NAME: `${BASE_API_URL}master/by_name`,
  MASTER_SEARCH_ADDRESS: `${BASE_API_URL}master/fetch_address`,

  CHALLAN_SMART_CREATE: `${BASE_API_URL}challan_smart/create`,
  CHALLAN_SMART_NEXT_NUMBER: `${BASE_API_URL}challan_smart/next_code_with_challan_date`,
  CHALLAN_SMART_LAST_NUMBER: `${BASE_API_URL}challan_smart/last_challan_number`,
  CHALLAN_SMART_PRINT: `${BASE_API_URL}challan_smart/print`,
  CHALLAN_UNIQUE_CREATE: `${BASE_API_URL}challan_unique/create`,
  CHALLAN_UNIQUE_NEXT_NUMBER: `${BASE_API_URL}challan_unique/next_code_with_challan_date`,
  CHALLAN_UNIQUE_LAST_NUMBER: `${BASE_API_URL}challan_unique/last_challan_number`,
  CHALLAN_UNIQUE_PRINT: `${BASE_API_URL}challan_unique/print`,

  RETAIL_NEXT_RCODE: `${BASE_API_URL}retail/next_rcode`,
  RETAIL_CREATE: `${BASE_API_URL}retail/create`,
  RETAIL_ENQUIRY: `${BASE_API_URL}retail/enquiry`, //append params
  RETAIL_LIST_OF_NOT_RECEIVED: `${BASE_API_URL}retail/list_of_not_received`,
  RETAIL_UPDATE_RECEIVED: `${BASE_API_URL}retail/update_received`,
  RETAIL_LIST_OF_UNSETTLED: `${BASE_API_URL}retail/list_of_unsettled`,
  RETAIL_UPDATE_UNSETTLED: `${BASE_API_URL}retail/update_unsettled`,
  RETAIL_LIST_OF_FINAL_SETTLEMENT: `${BASE_API_URL}retail/list_of_final_settlement`,
  RETAIL_UPDATE_FINAL_SETTLEMENT: `${BASE_API_URL}retail/update_final_settlement`,
  RETAIL_SHOW_RECEIPT_NAMES: `${BASE_API_URL}retail/show_receipt_names`,
  RETAIL_PRINT: `${BASE_API_URL}retail/print`,

  WARRANTY_NEXT_CODE: `${BASE_API_URL}warranty/next_srf_number`,
  WARRANTY_CREATE: `${BASE_API_URL}warranty/create`,
  WARRANTY_LIST_PENDING: `${BASE_API_URL}warranty/list_pending`,
  WARRANTY_BY_SRF_NUMBER: `${BASE_API_URL}warranty/by_srf_number`,
  WARRANTY_UPDATE: `${BASE_API_URL}warranty/update/`, //append srf_number
  WARRANTY_LIST_DELIVERED_BY: `${BASE_API_URL}warranty/list_delivered_by`,
  WARRANTY_LAST_SRF_NUMBER: `${BASE_API_URL}warranty/last_srf_number`,
  WARRANTY_SRF_PRINT: `${BASE_API_URL}warranty/srf_print`,
  WARRANTY_ENQUIRY: `${BASE_API_URL}warranty/enquiry`, //append params
  WARRANTY_SRF_NOT_SETTLED: `${BASE_API_URL}warranty/srf_not_settled`,
  WARRANTY_UPDATE_SRF_UNSETTLED: `${BASE_API_URL}warranty/update_srf_unsettled`,
  WARRANTY_LIST_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}warranty/list_of_final_srf_settlement`,
  WARRANTY_UPDATE_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}warranty/update_final_srf_settlement`,

  SERVICE_CENTER_LIST_NAMES: `${BASE_API_URL}service_center/list_names`,
  SERVICE_CENTER_CREATE: `${BASE_API_URL}service_center/create`,

  SERVICE_CHARGE: `${BASE_API_URL}service_charge/service_charge`,

  MODEL_CREATE: `${BASE_API_URL}model/create`,
  MODEL_LIST: `${BASE_API_URL}model/model_list`,
  MODEL_COST_DETAILS: `${BASE_API_URL}model/cost_details`,

  REWINDING_RATE_FOR_MODEL: `${BASE_API_URL}rewinding_rate/rewinding_rate`,

  COMPLAINT_NUMBER_UPLOAD: `${BASE_API_URL}complaint_number/upload`,
  COMPLAINT_NUMBER_LIST: `${BASE_API_URL}complaint_number/list_complaints`,

  CG_SRF_NUMBER_UPLOAD: `${BASE_API_URL}cg_srf_number/upload`,

  OUT_OF_WARRANTY_NEXT_CODE: `${BASE_API_URL}out_of_warranty/next_srf_number`,
  OUT_OF_WARRANTY_CREATE: `${BASE_API_URL}out_of_warranty/create`,
  OUT_OF_WARRANTY_LIST_PENDING: `${BASE_API_URL}out_of_warranty/list_pending`,
  OUT_OF_WARRANTY_BY_SRF_NUMBER: `${BASE_API_URL}out_of_warranty/by_srf_number`,
  OUT_OF_WARRANTY_UPDATE: `${BASE_API_URL}out_of_warranty/update/`, //append srf_number
  OUT_OF_WARRANTY_LAST_SRF_NUMBER: `${BASE_API_URL}out_of_warranty/last_srf_number`,
  OUT_OF_WARRANTY_SRF_PRINT: `${BASE_API_URL}out_of_warranty/srf_print`,
  OUT_OF_WARRANTY_SRF_NOT_SETTLED: `${BASE_API_URL}out_of_warranty/srf_not_settled`,
  OUT_OF_WARRANTY_UPDATE_SRF_UNSETTLED: `${BASE_API_URL}out_of_warranty/update_srf_unsettled`,
  OUT_OF_WARRANTY_LIST_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}out_of_warranty/list_of_final_srf_settlement`,
  OUT_OF_WARRANTY_UPDATE_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}out_of_warranty/update_final_srf_settlement`,
  OUT_OF_WARRANTY_ENQUIRY: `${BASE_API_URL}out_of_warranty/enquiry`, //append params

  VENDOR_NEXT_CHALLAN_CODE: `${BASE_API_URL}vendor/next_vendor_challan_code`,
  VENDOR_LAST_CHALLAN_CODE: `${BASE_API_URL}vendor/last_vendor_challan_code`,
  VENDOR_LIST_CHALLAN: `${BASE_API_URL}vendor/list_vendor_challan_details`,
  VENDOR_CREATE: `${BASE_API_URL}vendor/create_vendor_challan`,
  VENDOR_CHALLAN_PRINT: `${BASE_API_URL}vendor/vendor_challan_print`,
  VENDOR_LIST_RECEIVED_BY: `${BASE_API_URL}vendor/list_received_by`,
  VENDOR_NOT_SETTLED: `${BASE_API_URL}vendor/vendor_not_settled`,
  VENDOR_UPDATE_UNSETTLED: `${BASE_API_URL}vendor/update_vendor_unsettled`,
  VENDOR_FINAL_SETTLED: `${BASE_API_URL}vendor/list_of_final_vendor_settlement`,
  VENDOR_UPDATE_FINAL_SETTLED: `${BASE_API_URL}vendor/update_final_vendor_settlement`,
  VENDOR_UPDATE_COMPLAINT_NUMBER: `${BASE_API_URL}vendor/update_complaint_number`,
};

export default API_ENDPOINTS;
