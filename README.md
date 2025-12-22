# Complaint Management System  
## Unique Services
---

## Database Tables
- [ ] **User**
- [ ] **Employee**
- [ ] **Notification**
- [ ] **Holiday**
- [ ] **ComplaintNumber**	
- [ ] **StockCGPISL**
- [ ] **StockCGCL**
- [ ] **GRC**

---
## Frontend Pages

### Auth Module
- [ ] **LoginPage** – User authentication

### User Module
- [ ] **CreateUserPage** – Create User [ADMIN]
- [ ] **DeleteUserPage** – Delete User [ADMIN]
- [ ] **ShowAllUsersPage** – View All Users [ADMIN]
- [ ] **ShowStandardUsersPage** - View Standard Users
- [ ] **ChangePasswordPage** – Change password
- [ ] **AddNotificationPage** - Add notification [ADMIN]
- [ ] **NotificationResolvePage** - Resolving Notifications

### Dashboard Module
- [ ] **MenuDashboardPage** – Main dashboard for menu navigation
- [ ] **PageNotFound** – 404 error page
- [ ] **PageNotAvailable** – Maintenance/feature unavailable page

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



### Stock Module
- [ ] **StockUploadPage** - Upload stock file .xlxs [ADMIN]
- If stock item exists → Update quantity
- If stock item does not exist → Insert new record
- [ ] **StockEnquiryPage** - Stock Enquiry and Print


### GRC Module
- [ ] **GRCUploadPage** - Upload GRC file .xlxs [ADMIN]
- Overwrite operation
- Process:
  1. Truncate existing GRC table
  2. Insert fresh uploaded data
- [ ] **GRCEnquiryPage** - GRC Enquiry and Print
- [ ] **GRCChallanCreatePage** - GRC Challan Creation



---


## Backend Routes

### Auth Module
- [ ] **/auth/login**
- [ ] **/auth/logout**
- [ ] **/auth/me**

### User Module
- [ ] **/user/all_users** - [ADMIN]
- [ ] **/user/standard_users** 
- [ ] **/user/create_user** - [ADMIN]
- [ ] **/user/delete_user** - [ADMIN]
- [ ] **/user/reset_password**

### Notification Module
- [ ] **/notification/add_notification** - [ADMIN]
- [ ] **/notification/show_notification**
- Notifications are generated per user
- When a complaint is resolved:
- It will be moved out of active notifications
- Displayed as a **rolling bar** on the main dashboard


### Menu Module
- [ ] **/menu/dashboard**

### Pending Module

### Stock Module

### GRC Module

---

## Application Development

- [ ] **Authorization**
- [ ] **Database Schema**
- [ ] **Initial Deployment**
- [ ] **Backup**
- [ ] **Login**
- [ ] **Menu**
- [ ] **Wishes**
- [ ] **Notification**
- [ ] **User**
- [ ] **Email**
- [ ] **Complaint Number**
- [ ] **Stock**
- [ ] **GRC**
- [ ] **Final Deployment**

---





