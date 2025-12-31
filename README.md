# Complaint Management System  
## Unique Services
---
## To Do List
- Indent Enquiry Export 
- Save as Draft
- Finalize
- GRC Enquiry


- Dealer - 27/12
- Email - 28/12
- Complaint Pages - 29/12
- Pending - 30/12

---
## Database Tables
- [x] **User**
- [x] **Employee**
- [x] **Notification**
- [x] **Holiday**
- [ ] **ComplaintNumber**	
- [x] **StockCGPISL**
- [x] **StockCGCEL**
- [ ] **GRCCGPISL**
- [ ] **GRCCGCEL**
- [ ] **Dealer**

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
- [ ] **MenuDashboardPage** – Main dashboard for menu navigation
- [x] **PageNotFound** – 404 error page
- [x] **PageNotAvailable** – Maintenance/feature unavailable page

### Pending Module
- [ ] **PendingListPage** - Main Pending Page

### ComplaintNumber Module
- [ ] **ComplaintNumberUploadPage** - Upload complaint number file .xlxs [ADMIN]
- Admin can upload a new complaint file with the following logic:
1. **If complaint exists in both old and new file**
   - No action taken
2. **If complaint exists in new file but not in old**
   - Insert as new complaint
3. **If complaint exists in old file but not in new**
   - Update complaint status to **Cancelled**
- [ ] **ComplaintNumberCreatePage** - Create Complaint Number
- Create new complaint records
- Auto-generate complaint number
- [ ] **ComplaintNumberUpdatePage** - Update Complaint Number
- Update complaint details and status
- **Visit Later Option**
  - If selected:  
    - A new complaint is automatically created
    - Original complaint status updated accordingly
- [ ] **ComplaintNumberSendPage** - Send pending pdf to technician
- Generate pdf, either download or send to e-mail

### Stock CGCEL Module
- [x] **StockCGCELUploadPage** - Upload stock file .xlxs [ADMIN]
- [x] **StockCGCELEnquiryPage** - Stock Enquiry and Print
- [x] **StockCGCELSpareIndentPage** - Raise Spare Indent
- [x] **StockCGCELGenerateIndentPage** - Generate Spare Indent
- [x] **StockCGCELIndentDetailsPage** - Indent Details
- [x] **StockCGCELUpdateRecordPage** - Update CGCEL Stock

### Stock CGPISL Module
- [x] **StockCGPISLUploadPage** - Upload stock file .xlxs [ADMIN]
- [x] **StockCGPSILEnquiryPage** - Stock Enquiry and Print
- [x] **StockCGPSILSpareIndentPage** - Raise Spare Indent
- [x] **StockCGPSILGenerateIndentPage** - Generate Spare Indent
- [x] **StockCGPSILIndentDetailsPage** - Indent Details

### GRC CGCEL Module
- [x] **GRCCGCELUploadPage** - Upload GRC file .xlxs [ADMIN]
- [ ] **GRCCGCELReceivePage** - GRC Receive Material
- [ ] **GRCCGCELReturnPage** - GRC Return Material
- [ ] **GRCCGCELEnquiryPage** - GRC Enquiry and Print
- [ ] **GRCCGCELReportPage** - GRC Print

### GRC CGPISL Module
- [x] **GRCCGPISLUploadPage** - Upload GRC file .xlxs [ADMIN]
- [ ] **GRCCGPISLReceivePage** - GRC Receive Material
- [ ] **GRCCGPISLReturnPage** - GRC Return Material
- [ ] **GRCCGPISLEnquiryPage** - GRC Enquiry and Print
- [ ] **GRCCGPISLReportPage** - GRC Print

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
- [ ] **/menu/dashboard**

### Pending Module

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

### GRCCGPISL Module
- [x] **/grc_cgpisl/upload** - [ADMIN]


---

## Application Development

- [x] **Authorization**
- [x] **Database Schema**
- [ ] **Initial Deployment**
- [ ] **Backup**
- [x] **Login**
- [ ] **Menu**
- [x] **Wishes**
- [x] **Notification**
- [x] **Employee**
- [x] **User**
- [ ] **Email**
- [ ] **Complaint Number**
- [x] **Spare_CGCEL**
- [x] **Spare_CGPISL**
- [ ] **GRC_CGCEL**
- [ ] **GRC_CGPISL**
- [ ] **Final Deployment**

---





