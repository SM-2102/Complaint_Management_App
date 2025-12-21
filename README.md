# Complaint Management System  
## Unique Services
---

## Database Tables
- [ ] **User**

| Field Name | Description |
|----------|------------|
| username | Unique login ID |
| password | Encrypted password |
| is_active | User active/inactive flag |
| role | Admin / User |

- [ ] **Employee**

| Field | Description |
|------|------------|
| name | Employee full name |
| dob | Date of birth |
| age | Auto-calculated |
| phone | Contact number |
| address | Residential address |
| email | Email |
| aadhar | Aadhaar number |
| pan | PAN number |
| uan | UAN number |
| pf_number | Provident Fund number |
| joining_date | Date of joining |
| leaving_date | Date of leaving |
| is_active | Active employment status |

- [ ] **Notification**
- [ ] **ComplaintNumber**

## Complaint Master Table Structure

| Column Name | Data Type | Description / Example |
|------------|----------|------------------------|
| complaint_number | VARCHAR(15) **(PK)** | `CKK251205123456` / `N00001` |
| complaint_head | VARCHAR(10) | `CGCEL`, `CGPISL` |
| complaint_date | DATE | `12-12-2025` |
| complaint_time | VARCHAR(7) | `03:12PM` |
| complaint_type | VARCHAR(10) | `Service`, `Install`, `Sale` |
| complaint_status | VARCHAR(15) | `pending`, `fresh`, `new`, `closed` |
| complaint_priority | VARCHAR(15) | `NORMAL`, `HO-ESCALATION`, `CRM-ESCALATION`, `URGENT` |
| action_head | VARCHAR(30) | `INDENT TO BE DONE`, `TO BE ATTENDED`, `MAIL TO BE SENT`, `MAIL SENT` |
| action_by | VARCHAR(30) | Responsible person (Employee / CCO) |
| technician | VARCHAR(30) | Technician allotted |
| customer_type | VARCHAR(20) | `Dealer`, `Customer`, `Retailer` |
| customer_name | VARCHAR(40) | `Abhishek Mondal` |
| customer_add1 | VARCHAR(40) | `12, Ripon Lane` |
| customer_add2 | VARCHAR(40) | `2nd Floor` |
| customer_city | VARCHAR(30) | `Kolkata` |
| customer_pincode | INT(6) | `700016` |
| customer_contact1 | INT(10) | `9831025641` |
| customer_contact2 | INT(10) | `9533254125` |
| product_division | VARCHAR(20) | `FANS`, `APPL`, `LIGHT`, `WHC`, `SDA`, `PUMP`, `FHP MOTOR`, `LT MOTOR` |
| product_slno | VARCHAR(20) | `MMF01YC123015` |
| product_model | VARCHAR(25) | `CFHS48BRN1S` |
| invoice_date | DATE | `10-05-2025` |
| invoice_number | VARCHAR(25) | `SE/2025-26/0345` |
| dealer_name | VARCHAR(40) | `PRAKASH ELECTRICALS` |
| distributor_name | VARCHAR(40) | `RAMDEO FANS` |
| spare_pending | CHAR(1) | `Y` / `N` |
| spare1 | VARCHAR(30) | `2MFD CAPACITOR` |
| qty1 | INT(3) | `1` |
| indent_date1 | DATE | — |
| spare2 | VARCHAR(30) | — |
| qty2 | INT(3) | — |
| indent_date2 | DATE | — |
| spare3 | VARCHAR(30) | — |
| qty3 | INT(3) | — |
| indent_date3 | DATE | — |
| spare4 | VARCHAR(30) | — |
| qty4 | INT(3) | — |
| indent_date4 | DATE | — |
| spare5 | VARCHAR(30) | — |
| qty5 | INT(3) | — |
| indent_date5 | DATE | — |
| spare6 | VARCHAR(30) | — |
| qty6 | INT(3) | — |
| indent_date6 | DATE | — |
| current_status | VARCHAR(50) | `CAPACITOR TO BE CHANGED, SPARE AVAILABLE` |
| rfr_number | VARCHAR(9) | `RFR000001` |
| rfr_date | DATE | `21-12-2025` |
| replacement_reason | VARCHAR(30) | `DOA`, `Dent/Damage`, `Part Not Available`, `Repeat Failure`, `Quality Issue`, `Others` |
| replacement_remark | VARCHAR(40) | `CUSTOMER IS NOT ALLOWING TO REPAIR` |
| indentso_number | VARCHAR(20) | `2564125` |
| indentso_date | DATE | `18-12-2025` |
| created_by | VARCHAR(20) | `D Manna` |
| updated_by | VARCHAR(20) | `Milan Majhi` |
| updated_time | VARCHAR(20) | `21-12-25 14:25PM` |			

- [ ] **Stock**

| Column Name | Data Type | Description / Example |
|------------|----------|------------------------|
| division | VARCHAR(20) | `FANS`, `APPL`, `LIGHT`, `WHC`, `SDA`, `PUMP`, `FHP MOTOR`, `LT MOTOR` |
| spare_code | VARCHAR(30) | Unique spare identifier |
| head | VARCHAR(10) | `CGCEL`, `CGPISL` |
| spare_description | VARCHAR(40) | `2MFD CAPACITOR` |
| qty | INT | Available quantity |
| alp | FLOAT | Authorized List Price |
| sale_price | FLOAT | Selling price |

- [ ] **GRC**

| Column Name | Data Type | Description / Example |
|------------|----------|------------------------|
| spare_code | VARCHAR(30) **(PK)** | Unique spare identifier |
| division | VARCHAR(20) | `FANS`, `APPL`, `LIGHT`, `WHC`, `SDA`, `PUMP`, `FHP MOTOR`, `LT MOTOR` |
| head | VARCHAR(10) | `CGCEL`, `CGPISL` |
| grc_no | INT | GRC reference number |
| grc_date | DATE | GRC transaction date |
| spare_description | VARCHAR(40) | `2MFD CAPACITOR` |
| issue_qty | INT | Quantity issued |
| grc_pending_qty | INT | Pending quantity as per GRC |
| good_qty | INT | Good condition quantity |
| defective_qty | INT | Defective quantity |
| returned_qty | INT | Quantity returned |
| returning_qty | INT | Quantity in return process |
| actual_pending_qty | INT | System-calculated pending quantity |
| due_qty | INT | Quantity due |
| dispute_remark | VARCHAR(40) | Dispute notes, if any |
| challan_number | VARCHAR(10) | Delivery challan number |
| challan_date | DATE | Challan date |
| docket_number | VARCHAR(8) | Courier / docket reference |
| sent_through | VARCHAR(20) | Courier / transport mode |
| remark | VARCHAR(40) | General remarks |
| challan_by | VARCHAR(20) | Foreign key to users |

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





