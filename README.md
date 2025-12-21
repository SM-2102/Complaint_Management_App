# Complaint Management System  
## Unique Services

---

## 1. Overview

The **Complaint Management System (CMS)** is a role-based web application designed for **Unique Services** to manage customer complaints, employee operations, inventory, and reporting.  
The system supports **administrative control**, **technician workflows**, **complaint lifecycle management**, and **data-driven analysis**.

---

## 2. User Roles

### 2.1 Admin
- Full system access
- Data upload and overwrite privileges
- Stock and master data management
- User and employee administration

### 2.2 User (Employee / Technician)
- Complaint handling
- Reporting and daily operations
- Stock and GRC view access
- Notifications and alerts

---

## 3. Authentication & Access Control

### 3.1 Login
- Secure login page
- Username & password authentication
- Role-based menu rendering
- Inactive users are restricted from login

### 3.2 User Authentication Table
| Field Name | Description |
|----------|------------|
| username | Unique login ID |
| password | Encrypted password |
| is_active | User active/inactive flag |
| role | Admin / User |

---

## 4. Employee Management

### 4.1 Employee Master Table
| Field | Description |
|------|------------|
| name | Employee full name |
| dob | Date of birth |
| age | Auto-calculated |
| phone | Contact number |
| address | Residential address |
| aadhar | Aadhaar number |
| pan | PAN number |
| uan | UAN number |
| pf_number | Provident Fund number |
| joining_date | Date of joining |
| leaving_date | Date of leaving |
| is_active | Active employment status |

### 4.2 Employee Operations
- Create employee
- Delete employee
- View all employees
- Activate / deactivate employee

---

## 5. User Menu Features

After login, users will have access to:

- Create Employee *(Admin only)*
- Delete Employee *(Admin only)*
- Change Password
- View All Users
- Send Internal Messages

---

## 6. Dashboard & Notifications

### 6.1 Post-Login Dashboard
- 🎉 **Birthday wishes** for employees
- 📅 **Holiday list**
- 🔔 **User-specific notifications**

### 6.2 Notification System
- Notifications are generated per user
- When a complaint is resolved:
  - It is moved out of active notifications
- Displayed as a **rolling bar** on the main dashboard

---

## 7. Complaint Management

### 7.1 User Functionalities

#### Add Complaint
- Create new complaint records
- Auto-generate complaint number

#### Update Complaint
- Update complaint details and status
- **Visit Later Option**
  - If selected:  
    - A new complaint is automatically created
    - Original complaint status updated accordingly

#### Pending Report
- View all pending complaints
- Filter by date, technician, priority

#### Daily Pending Report
- Generate daily pending list
- Send report to technician phone numbers
- Print option available

---

## 8. RAFR Module

### 8.1 Create RAFR
- Generate RAFR entries linked to complaints

### 8.2 RAFR Report
- View and export RAFR reports
- Filter by date and technician

---

## 9. Enquiry Module
- Log and track customer enquiries
- Convert enquiry into complaint if required

---

## 10. Stock & GRC Management

### 10.1 Stock View (User)
- Read-only stock availability view

### 10.2 GRC View (User)
- View GRC data uploaded by admin

---

## 11. Admin-Only Functionalities

### 11.1 Fresh Complaint Upload
Admin can upload a new complaint file with the following logic:

1. **If complaint exists in both old and new file**
   - No action taken
2. **If complaint exists in new file but not in old**
   - Insert as new complaint
3. **If complaint exists in old file but not in new**
   - Update complaint status to **Cancelled**

---

### 11.2 Stock Update
- If stock item exists → Update quantity
- If stock item does not exist → Insert new record

---

### 11.3 GRC Upload
- Overwrite operation
- Process:
  1. Truncate existing GRC table
  2. Insert fresh uploaded data

---

## 12. Reports

- Pending Complaint Report
- Daily Pending Report
- RAFR Report
- Technician-wise Complaint Report
- Status-wise Complaint Report

---

## 13. Analysis & Dashboards

### 13.1 Planned Analytics
- Complaint trend analysis
- Technician performance
- Product / division-wise complaints
- Pending vs resolved ratio
- Replacement and spare usage insights

*(Charts and dashboards to be implemented in later phase)*

---

## 14. Non-Functional Requirements

- Secure authentication
- Role-based access control
- Audit tracking (created by / updated by)
- Scalable design for future enhancements
- Responsive UI

---

## 15. Future Enhancements (Optional)
- SLA tracking
- Mobile app integration
- WhatsApp/SMS alerts
- Cost and warranty analytics
- Customer portal access

---

**Document Version:** 1.0  
**Client:** Unique Services  
**Application:** Complaint Management System
