# Complaint Management System

## Unique Services

---

## To Do List


- Create RFR Record
- Print RFR Record
- Invoice Create
- Invoice Update

---

## Frontend Pages

### Auth Module

- [x] **LoginPage** – User authentication
- [x] **ChangePasswordPage** – Change password

### Employee Module

- [x] **EmployeeCreatePage** – Create Employee [ADMIN]
- [x] **EmployeeDeletePage** – Delete Employee [ADMIN]
- [x] **EmployeeShowAllPage** – View All Users [ADMIN]
- [x] **EmployeeShowStandardPage** - View Standard Users

### Notification Module

- [x] **NotificationCreatePage** - Add notification [ADMIN]

### Dashboard Module

- [x] **MenuDashboardPage** – Main dashboard for menu navigation
- [x] **PageNotFound** – 404 error page
- [x] **PageNotAvailable** – Maintenance/feature unavailable page

### Complaint Module

- [x] **ComplaintPendingPage** - Main Pending Page
- [x] **ComplaintNumberUploadPage** - Upload complaint number file .csv [ADMIN]
- [x] **ComplaintReallocationPage** - Reallocate Complaints
- [x] **ComplaintNumberCreatePage** - Create Complaint Number
- [x] **ComplaintNumberUpdatePage** - Update Complaint Number
- [x] **ComplaintNumberSendPage** - Send Complaint Number via Email

### Stock CGCEL Module

- [x] **StockCGCELUploadPage** - Upload stock file .csv [ADMIN]
- [x] **StockCGCELEnquiryPage** - Stock Enquiry and Print
- [x] **StockCGCELSpareIndentPage** - Raise Spare Indent
- [x] **StockCGCELGenerateIndentPage** - Generate Spare Indent
- [x] **StockCGCELIndentDetailsPage** - Indent Details
- [x] **StockCGCELUpdateRecordPage** - Update CGCEL Stock

### Stock CGPISL Module

- [x] **StockCGPISLUploadPage** - Upload stock file .csv [ADMIN]
- [x] **StockCGPSILEnquiryPage** - Stock Enquiry and Print
- [x] **StockCGPSILSpareIndentPage** - Raise Spare Indent
- [x] **StockCGPSILGenerateIndentPage** - Generate Spare Indent
- [x] **StockCGPSILIndentDetailsPage** - Indent Details

### GRC CGCEL Module

- [x] **GRCCGCELUploadPage** - Upload GRC file .csv [ADMIN]
- [x] **GRCCGCELReceivePage** - GRC Receive Material
- [x] **GRCCGCELReturnPage** - GRC Return Material
- [x] **GRCCGCELEnquiryPage** - GRC Enquiry and Print
- [x] **GRCCGCELReportPage** - GRC Print

### GRC CGPISL Module

- [x] **GRCCGPISLUploadPage** - Upload GRC file .csv [ADMIN]
- [x] **GRCCGPISLReceivePage** - GRC Receive Material
- [x] **GRCCGPISLReturnPage** - GRC Return Material
- [x] **GRCCGPISLEnquiryPage** - GRC Enquiry and Print
- [x] **GRCCGPISLReportPage** - GRC Print

### Customer Module
- [x] **CustomerCreatePage** - Create Customer record
- [x] **CustomerUpdatePage** - Update Customer record

---

## Backend Routes

### Auth Module

- [x] **/auth/login**
- [x] **/auth/logout**
- [x] **/auth/me**
- [x] **/auth/reset_password**
- [x] **/auth/refresh_token**

### Employee Module

- [x] **/employee/all_employees** - [ADMIN]
- [x] **/employee/standard_employees**
- [x] **/employee/create_employees** - [ADMIN]
- [x] **/employee/delete_employees** - [ADMIN]

### Notification Module

- [x] **/notification/create_notification** - [ADMIN]
- [x] **/notification/notifications** - [ADMIN]
- [x] **/notification/count_notifications** - [ADMIN]
- [x] **/notification/user_notifications**
- [x] **/notification/resolve_notification**

### Menu Module

- [x] **/menu/dashboard**

### Complaint Module
- [x] **/complaints/upload** - [ADMIN]
- [x] **/complaints/action_heads**
- [x] **/complaints/enquiry{params}**
- [x] **/complaints/complaint_filter_data**
- [x] **/complaints/employees**
- [x] **/complaints/complaint_allocation_data/{allocated_to}**
- [x] **/complaints/reallocate_complaints**
- [x] **/complaints/create**
- [x] **/complaints/complaint_create_data**
- [x] **/by_complaint_number/{complaint_number}**
- [x] **/complaint_update_data**
- [x] **/update/{complaint_number}**
- [x] **/send_email**
- [x] **/mail_technician_list**

### StockCGCEL Module

- [x] **/stock_cgcel/upload** - [ADMIN]
- [x] **/stock_cgcel/enquiry{params}**
- [x] **/stock_cgcel/spare_list**
- [x] **/stock_cgcel/spare_list_by_division/{division}**
- [x] **/stock_cgcel/by_code**
- [x] **/stock_cgcel/by_name**
- [x] **/stock_cgcel/create_indent**
- [x] **/stock_cgcel/update**
- [x] **/stock_cgcel/indent_details/{division}**
- [x] **/stock_cgcel/next_indent_code**
- [x] **/stock_cgcel/generate_indent**
- [x] **/stock_cgcel/indent_enquiry{params}**

### StockCGPISL Module

- [x] **/stock_cgpisl/upload** - [ADMIN]
- [x] **/stock_cgpisl/enquiry{params}**
- [x] **/stock_cgcel/spare_list**
- [x] **/stock_cgcel/spare_list_by_division/{division}**
- [x] **/stock_cgcel/by_code**
- [x] **/stock_cgcel/by_name**
- [x] **/stock_cgcel/create_indent**
- [x] **/stock_cgcel/indent_details/{division}**
- [x] **/stock_cgcel/next_indent_code**
- [x] **/stock_cgcel/generate_indent**
- [x] **/stock_cgcel/indent_enquiry{params}**

### GRCCGCEL Module

- [x] **/grc_cgcel/upload** - [ADMIN]
- [x] **/grc_cgcel/not_received_grc**
- [x] **/grc_cgcel/not_received_by_grc_number/{grc_number}**
- [x] **/grc_cgcel/update_receive**
- [x] **/grc_cgcel/grc_return_by_division/{division}**
- [x] **/grc_cgcel/next_challan_code**
- [x] **/grc_cgcel/save_grc_return**
- [x] **/grc_cgcel/print_report/{report_type}**
- [x] **/grc_cgcel/finalize_grc_return**
- [x] **/grc_cgcel/enquiry/{params}**

### GRCCGPISL Module
- [x] **/grc_cgpisl/upload** - [ADMIN]
- [x] **/grc_cgpisl/not_received_grc**
- [x] **/grc_cgpisl/not_received_by_grc_number/{grc_number}**
- [x] **/grc_cgpisl/update_receive**
- [x] **/grc_cgpisl/grc_return_by_division/{division}**
- [x] **/grc_cgpisl/next_challan_code**
- [x] **/grc_cgpisl/save_grc_return**
- [x] **/grc_cgpisl/print_report/{report_type}**
- [x] **/grc_cgpisl/finalize_grc_return**
- [x] **/grc_cgpisl/enquiry/{params}**

### Customer Module
- [x] **/customer/create**
- [x] **/customer/next_code**
- [x] **/customer/list_names** 
- [x] **/customer/by_code** 
- [x] **/customer/by_name**
- [x] **/customer/update{code}**

---

## Application Development

- [x] **Authorization**
- [x] **Database Schema**
- [x] **Initial Deployment**
- [x] **Backup**
- [x] **Login**
- [x] **Menu**
- [x] **Wishes**
- [x] **Notification**
- [x] **Employee**
- [x] **User**
- [x] **Email**
- [ ] **Complaint Number**
- [ ] **Stock_CGCEL**
- [ ] **Stock_CGPISL**
- [x] **GRC_CGCEL**
- [x] **GRC_CGPISL**
- [ ] **Final Deployment**

---
