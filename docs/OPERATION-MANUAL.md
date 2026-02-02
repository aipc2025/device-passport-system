# Device Passport System - Operation Manual

**Version:** 1.0
**Last Updated:** February 2026
**System Domain:** Electromechanical Automation Equipment Trading and Service Platform

---

## Table of Contents

1. [Getting Started Guide](#1-getting-started-guide)
2. [User Roles Overview](#2-user-roles-overview)
3. [Core Features](#3-core-features)
4. [Admin Operations](#4-admin-operations)
5. [Expert Workflow](#5-expert-workflow)
6. [Customer Workflow](#6-customer-workflow)
7. [Marketplace Usage](#7-marketplace-usage)
8. [Points System](#8-points-system)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)

---

## 1. Getting Started Guide

### 1.1 System Requirements

**For Web Access:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection (minimum 2 Mbps recommended)
- Screen resolution: 1024x768 or higher
- JavaScript enabled

**For Mobile Access:**
- iOS 13+ or Android 8+
- Mobile browser or PWA installation
- GPS enabled (for location-based features)

### 1.2 Account Registration

#### Company Registration

1. Navigate to the registration page
2. Select "Company Registration"
3. Fill in company information:
   - **Company Name** (required)
   - **Company Type** (LLC, Corporation, Partnership, etc.)
   - **Business License Number** (required)
   - **Tax ID/Registration Number**
   - **Country** and **Address**
   - **Company Email** and **Phone**
   - **Website** (optional)

4. Select your company role:
   - **Supplier** - If you supply equipment
   - **Buyer** - If you purchase equipment
   - **Both** - If you both supply and purchase

5. Add contacts:
   - **Business Contact** (required)
   - **Technical Contact** (recommended)
   - **Finance Contact** (optional)
   - **Emergency Contact** (optional)

6. Upload required documents:
   - Business License (PDF/JPG, max 10MB)
   - Additional certifications (optional)

7. Create admin account credentials:
   - Email address (will be used for login)
   - Password (min 8 characters, must include uppercase, lowercase, number)
   - Admin name

8. Submit registration
9. Wait for admin approval (typically 1-3 business days)
10. Check email for approval notification

#### Individual Expert Registration

1. Navigate to the registration page
2. Select "Individual Expert Registration"
3. Choose expert type:
   - **Technical Expert** (T) - Technical service providers
   - **Business Expert** (B) - Business consultants
   - **Both** (A) - Technical + Business combined

4. Fill in personal information:
   - **Full Name** (required)
   - **ID Number** (required for verification)
   - **Phone Number** (required)
   - **Email Address** (required)
   - **Date of Birth**
   - **Nationality** (ISO country code)

5. Select your expertise:
   - **Industries** (select 1-3): Automotive, Electronics, Food & Beverage, etc.
   - **Skills** (select 1-5): PLC Programming, Robotics, Electrical Design, etc.

6. Professional information:
   - **Professional Field**
   - **Services Offered** (detailed description)
   - **Years of Experience**
   - **Certifications** (upload documents)
   - **Service Radius** (in kilometers)

7. Add emergency contact:
   - Name, phone, relationship

8. Upload documents:
   - Resume/CV (required)
   - Professional certificates (recommended)
   - ID photo (required for verification)

9. Create account credentials
10. Submit for review
11. Wait for admin approval and expert code generation

### 1.3 Login Process

1. Navigate to the login page
2. Enter your registered email address
3. Enter your password
4. Click "Login"
5. (Optional) Check "Remember Me" for auto-login on trusted devices
6. Complete two-factor authentication if enabled

**Password Reset:**
1. Click "Forgot Password?" on login page
2. Enter your registered email
3. Check email for reset link (valid for 1 hour)
4. Click link and create new password
5. Login with new credentials

---

## 2. User Roles Overview

The system implements a comprehensive Role-Based Access Control (RBAC) with the following roles:

### 2.1 PUBLIC
- **Permission Level:** 0 (Lowest)
- **Access:** View public device information, submit service requests
- **Typical Users:** Anonymous visitors, potential customers
- **Key Features:**
  - Scan QR codes to view public device info
  - Browse public marketplace listings
  - Submit public service requests

### 2.2 CUSTOMER
- **Permission Level:** 1
- **Access:** View owned devices, service history, submit authenticated requests
- **Typical Users:** Equipment buyers, end users
- **Key Features:**
  - View device details and lifecycle history
  - Submit service requests for owned devices
  - Track service progress
  - Leave reviews for experts
  - Access customer portal

### 2.3 EXPERT (Technical & Business)
- **Permission Level:** Variable
- **Types:**
  - **Technical Expert (T):** Repair, maintenance, installation services
  - **Business Expert (B):** Consulting, training, certification support
  - **Comprehensive Expert (A):** Both technical and business services
- **Key Features:**
  - Receive expert passport code (EP-{TYPE}-{YYMM}-{SEQUENCE}-{CHECKSUM})
  - View matched service requests
  - Accept and complete service orders
  - Manage work status and availability
  - Earn points and build reputation
  - Access expert dashboard

### 2.4 ENGINEER
- **Permission Level:** 2
- **Access:** Execute service orders, access technical documentation
- **Typical Users:** Field technicians, service engineers
- **Key Features:**
  - View assigned service orders
  - Update service progress
  - Access device manuals and specs
  - Report service completion

### 2.5 QC_INSPECTOR
- **Permission Level:** 3
- **Access:** Quality control inspection and status updates
- **Typical Users:** Quality assurance staff
- **Key Features:**
  - Update QC status (QC_PASSED, QC_FAILED)
  - Perform inspections
  - Add QC notes and attachments
  - View inspection history

### 2.6 OPERATOR
- **Permission Level:** 4
- **Access:** Create devices, manage orders, process operations
- **Typical Users:** Operations staff, production managers
- **Key Features:**
  - Create device passports
  - Update device status
  - Manage service orders
  - Access operational reports

### 2.7 ADMIN
- **Permission Level:** 5 (Highest)
- **Access:** Full system access, user management, configuration
- **Typical Users:** System administrators, platform managers
- **Key Features:**
  - Manage all users and organizations
  - Approve registrations
  - Configure point rules
  - Generate reports
  - System configuration
  - Access all modules

### 2.8 SUPPLIER (Organization Roles)
- **SUPPLIER_VIEWER** (Level 1): View-only access to supplier organization data
- **SUPPLIER_QC** (Level 2): QC inspector at supplier organization
- **SUPPLIER_PACKER** (Level 3): Packaging staff at supplier
- **SUPPLIER_SHIPPER** (Level 3): Shipping staff at supplier
- **SUPPLIER_ADMIN** (Level 4): Admin at supplier organization

### 2.9 BUYER
- **Access:** Create RFQs, browse marketplace, send inquiries
- **Key Features:**
  - Create buyer requirements (RFQs)
  - Browse supplier products
  - Send inquiries to suppliers
  - View matched products
  - Negotiate with suppliers

---

## 3. Core Features

### 3.1 Device Passport Scanning

**QR Code Format:**
```
DP-{COMPANY}-{YYMM}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
Example: DP-MED-2601-PF-CN-000001-A7
```

**How to Scan:**

1. **Using Mobile Device:**
   - Open the app or web browser
   - Navigate to "Scan" feature
   - Point camera at QR code
   - Allow camera access when prompted
   - System auto-detects and displays device info

2. **Manual Code Entry:**
   - Navigate to scan page
   - Click "Enter Code Manually"
   - Type the full passport code
   - Click "Search"

**Public Information Displayed:**
- Device name and model
- Manufacturer information
- Product line classification
- Country of origin
- Current status
- Manufacture date
- Warranty status and expiry date
- Service history (if authorized)

**For Authenticated Users (Additional Info):**
- Detailed specifications
- Full lifecycle history
- Current location
- Buyer information (if authorized)
- Service records
- Maintenance schedule
- Quality inspection reports

### 3.2 Device Status Flow

Devices progress through the following lifecycle stages:

```
CREATED → PROCURED → IN_QC → QC_PASSED → IN_ASSEMBLY →
IN_TESTING → TEST_PASSED → PACKAGED → IN_TRANSIT →
DELIVERED → IN_SERVICE → [MAINTENANCE] → [RETIRED]
```

**Status Descriptions:**

| Status | Description | Who Can Update |
|--------|-------------|----------------|
| CREATED | Device passport created | OPERATOR, ADMIN |
| PROCURED | Device procured from supplier | OPERATOR, ADMIN |
| IN_QC | Under quality control inspection | QC_INSPECTOR, ADMIN |
| QC_PASSED | Passed quality control | QC_INSPECTOR, ADMIN |
| QC_FAILED | Failed quality control | QC_INSPECTOR, ADMIN |
| IN_ASSEMBLY | Being assembled | OPERATOR, ADMIN |
| IN_TESTING | Under testing | OPERATOR, ADMIN |
| TEST_PASSED | Passed testing | OPERATOR, ADMIN |
| TEST_FAILED | Failed testing | OPERATOR, ADMIN |
| PACKAGED | Packaged for shipping | SUPPLIER_PACKER, ADMIN |
| IN_TRANSIT | In transit to customer | SUPPLIER_SHIPPER, ADMIN |
| DELIVERED | Delivered to customer | OPERATOR, ADMIN |
| IN_SERVICE | Currently in service | OPERATOR, ADMIN |
| MAINTENANCE | Under maintenance | ENGINEER, ADMIN |
| RETIRED | Decommissioned | ADMIN |

### 3.3 Service Request Submission

**Public Service Request (No Login Required):**

1. Navigate to "Request Service" page
2. Fill in basic information:
   - **Service Title** (brief description)
   - **Service Category:**
     - Device Service (Repair, Maintenance, Installation, Inspection, Registration)
     - Labor Service (Electrical, Mechanical, Plumbing, General)
     - Consulting (Technical, Training, Certification)
   - **Detailed Description** of the issue/requirement

3. Device information (if applicable):
   - Scan or enter device passport code
   - OR manually enter device details

4. Contact information:
   - Your name
   - Phone number
   - Email address (optional)

5. Location information:
   - Service address
   - Allow GPS location (optional, for better matching)

6. Additional details:
   - Urgency level (Low, Normal, High, Urgent)
   - Preferred service date
   - Budget range
   - Upload photos/videos (optional, max 5 files, 10MB each)

7. Review and submit
8. Receive service request code (SR-YYMM-NNNNNN)
9. Track request status via code

**Authenticated Service Request (Logged In):**

Additional benefits:
- Auto-filled contact information
- Access to owned device list for selection
- Ability to save as draft
- Receive notifications for status updates
- View service history
- Direct communication with assigned expert

---

## 4. Admin Operations

### 4.1 Creating Device Passports

**Prerequisites:**
- Admin or Operator role
- Product type configuration set up
- Organization (supplier/customer) registered

**Steps:**

1. Navigate to **Dashboard → Devices → Create Passport**

2. Select **Product Line:**
   - PF: Packaging Filling
   - QI: Quality Inspection
   - MP: Metal Processing
   - PP: Plastics Processing
   - HL: Hospital Lab
   - ET: Education Training
   - WL: Warehouse Logistics
   - IP: Industrial Parts
   - CS: Custom Solutions

3. Select **Origin Code:**
   - CN: China
   - DE: Germany
   - JP: Japan
   - US: United States
   - KR: South Korea
   - TW: Taiwan
   - IT: Italy
   - FR: France
   - GB: United Kingdom
   - CH: Switzerland
   - VN: Vietnam
   - OTHER: Custom origin (requires manual entry)

4. Enter **Device Information:**
   - Device Name (required)
   - Device Model (required)
   - Manufacturer (required)
   - Manufacturer Part Number (optional)
   - Serial Number (optional)

5. Add **Specifications** (JSON format or form):
   ```json
   {
     "power": "380V/50Hz",
     "capacity": "100 units/hour",
     "dimensions": "2000x1500x1800mm",
     "weight": "850kg"
   }
   ```

6. Set **Dates:**
   - Manufacture Date (optional)
   - Warranty Expiry Date (optional)

7. Assign **Organizations:**
   - Supplier (select from registered suppliers)
   - Customer (optional, can be assigned later)

8. Set **Initial Location:**
   - Address or facility name

9. Click **Generate Passport**

10. System generates unique code and QR code

11. Download or print QR code label

**Passport Code Auto-Generation:**
- Format: `DP-{COMPANY}-{YYMM}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}`
- Company: 3-letter organization code
- YYMM: Year-Month (e.g., 2601 for Jan 2026)
- Sequence: Auto-incremented (000001, 000002, ...)
- Checksum: Calculated validation code (e.g., A7)

### 4.2 Managing Suppliers

**View Suppliers:**
1. Navigate to **Dashboard → Organizations → Suppliers**
2. View list with filters:
   - Registration status
   - Country
   - Product lines
   - Active/Inactive

**Approve/Reject Supplier Registration:**

1. Click on pending supplier application
2. Review submitted information:
   - Company details
   - Business license
   - Contact information
   - Products/services offered
3. Verify documents
4. Add admin notes (optional)
5. Decision:
   - **Approve:** Click "Approve" → Supplier receives email notification → Account activated
   - **Reject:** Click "Reject" → Enter reason → Supplier notified
   - **Request More Info:** Add comment and set status to "Under Review"

**Edit Supplier Information:**
1. Click on approved supplier
2. Click "Edit"
3. Update information (address, contacts, products, etc.)
4. Save changes
5. Changes logged in audit trail

**Deactivate Supplier:**
1. Click on supplier
2. Click "Deactivate"
3. Enter reason
4. Confirm action
5. Supplier account suspended (can be reactivated later)

### 4.3 Approving Registrations

**Company Registration Approval:**

1. Navigate to **Dashboard → Registrations → Pending Companies**
2. Review application details:
   - Company profile
   - Legal documents
   - Contact information
   - Declared roles (Supplier/Buyer)
3. Check document authenticity
4. Review by compliance team (if required)
5. Actions:
   - **Approve:** Generate company code → Create organization → Send welcome email
   - **Reject:** Provide detailed reason → Notify applicant
   - **Suspend:** Put on hold pending investigation

**Expert Registration Approval:**

1. Navigate to **Dashboard → Registrations → Pending Experts**
2. Review application:
   - Personal information (verify ID)
   - Professional background
   - Certifications and credentials
   - Service areas and skills
3. Verify certifications (contact issuing authorities if needed)
4. Check background (optional, for high-level experts)
5. Actions:
   - **Approve:**
     - Generate Expert Passport Code (EP-{TYPE}-{YYMM}-{SEQUENCE}-{CHECKSUM})
     - Example: `EP-T-2601-000042-B5` (Technical Expert, Jan 2026, Sequence 42)
     - Activate expert profile
     - Send approval email with expert code
   - **Reject:** Provide specific feedback
   - **Request Verification:** Ask for additional documents/references

### 4.4 Configuring Point Rules

**Access Point Rules:**
1. Navigate to **Dashboard → System → Point Rules**
2. View existing rules with categories:
   - Reward Actions
   - Penalty Actions
   - Credit Adjustments

**Create New Point Rule:**

1. Click "Create Rule"
2. Fill in details:
   - **Action Code** (select from predefined list)
   - **Point Type:**
     - REWARD: Spendable points
     - CREDIT: Credit score (affects ranking)
     - PENALTY: Negative points
   - **Point Value** (positive for rewards, negative for penalties)
   - **Description** (explain when this rule applies)
   - **Is Active** (enable/disable rule)

3. Set conditions (optional):
   - User type (CUSTOMER, EXPERT)
   - Minimum transaction amount
   - Frequency limits (e.g., once per day)

4. Save rule

**Example Rules:**

| Action Code | Type | Points | Description |
|-------------|------|--------|-------------|
| SERVICE_COMPLETED | REWARD | +30 | Expert completes a service |
| FIVE_STAR_REVIEW | REWARD | +50 | Expert receives 5-star review |
| ON_TIME_COMPLETION | REWARD | +10 | Service completed on time |
| CANCEL_ORDER_EXPERT | PENALTY | -50 | Expert cancels accepted order without valid reason |
| SERVICE_TIMEOUT | PENALTY | -20 | Service not completed within deadline |
| INVITE_REGISTER | REWARD | +100 | User invites new registration |

**Edit Existing Rule:**
1. Click on rule in list
2. Modify values or conditions
3. Save changes
4. Changes apply to new transactions only

**Deactivate Rule:**
1. Click on rule
2. Toggle "Is Active" to OFF
3. Confirm
4. Rule no longer applies to new actions

### 4.5 Managing Service Requests

**View All Service Requests:**
1. Navigate to **Dashboard → Service → Requests**
2. Filter by:
   - Status (Draft, Open, In Progress, Completed, Cancelled)
   - Category (Device, Labor, Consulting)
   - Urgency level
   - Date range
   - Assigned expert

**Manually Assign Expert:**

1. Click on open service request
2. View request details and requirements
3. Click "Find Experts"
4. System shows matched experts based on:
   - Skills matching
   - Location proximity
   - Availability status
   - Rating and experience
   - Work status (RUSHING prioritized)
5. Review expert profiles
6. Select expert
7. Click "Assign"
8. Expert receives notification
9. Expert can accept or decline within 24 hours

**Monitor Service Progress:**

1. View service request dashboard
2. Check status updates from expert:
   - Accepted (expert accepted assignment)
   - In Progress (expert started work)
   - Awaiting Customer Confirmation (expert completed work)
   - Completed (customer confirmed)
3. View timeline and milestones
4. Check expert notes and updates
5. View uploaded photos/reports

**Handle Disputes:**

1. Navigate to disputed service
2. Review both parties' statements
3. Check service record and evidence
4. Contact parties for clarification
5. Make decision:
   - Side with customer: Issue refund/credit, penalize expert
   - Side with expert: Close dispute, award points to expert
   - Partial resolution: Split costs, adjust points accordingly
6. Document decision in system
7. Notify both parties

---

## 5. Expert Workflow

### 5.1 Expert Profile Management

**Access Your Profile:**
1. Login to expert account
2. Navigate to **Dashboard → My Profile**

**Update Basic Information:**
- Personal name (display name for customers)
- Bio/Introduction (max 500 characters)
- Phone number
- Emergency contact details
- Profile photo (recommended, max 2MB)

**Update Professional Information:**

1. Click "Edit Profile"
2. Update fields:
   - **Industries:** Select 1-3 primary industries
   - **Skills:** Select 1-5 core skills
   - **Services Offered:** Detailed description (max 2000 chars)
   - **Years of Experience**
   - **Professional Field**
   - **Service Radius:** Distance willing to travel (in km)

3. Upload/Update Certifications:
   - Click "Add Certificate"
   - Upload certificate document (PDF/JPG)
   - Enter certificate name and issuing authority
   - Set expiry date (if applicable)
   - Repeat for multiple certificates

4. Update Work History:
   - Click "Add Work History"
   - Enter company name, position, dates
   - Describe responsibilities and achievements
   - Add reference contact (optional)
   - Mark as "Request Verification" for platform verification

5. Set Location:
   - Enter current location address
   - Allow GPS location for automatic updates
   - Set preferred service areas (cities/regions)

6. Save changes

**Profile Visibility:**
- Toggle "Public Profile" ON/OFF
- Public profiles appear in expert directory
- Private profiles only visible to matched customers

### 5.2 Work Status Management

Expert work status determines matching priority and availability.

**Work Status Options:**

| Status | Description | When to Use | Matching Priority |
|--------|-------------|-------------|-------------------|
| RUSHING | Urgently need orders, actively seeking work | When you have no current work and need assignments ASAP | Highest (Priority 1) |
| IDLE | Available and waiting for assignments | General availability, no urgent need | High (Priority 2) |
| BOOKED | Have accepted orders but currently not working | Between scheduled services | Medium (Priority 3) |
| IN_SERVICE | Currently working on a service | When you've started a service and are onsite/working | Low (No new assignments) |
| OFF_DUTY | Not accepting new orders | Rest periods, vacation, unavailable | None (Excluded from matching) |

**How to Change Work Status:**

**Method 1: Quick Toggle (Dashboard)**
1. Login to expert dashboard
2. See current status indicator at top
3. Click on status badge
4. Select new status from dropdown
5. Status changes immediately
6. System updates matching algorithm

**Method 2: Schedule Status Changes**
1. Navigate to **Dashboard → My Schedule**
2. Click "Set Status Schedule"
3. Define time blocks:
   - Date/time range
   - Status for that period
   - Repeat pattern (optional: daily, weekly)
4. Save schedule
5. System auto-changes status at scheduled times

**Best Practices:**
- Set to RUSHING when you need work urgently (increases visibility)
- Change to IN_SERVICE when starting work (prevents double-booking)
- Use OFF_DUTY during nights, weekends, or personal time
- BOOKED status helps you accept future orders while completing current ones
- Update status promptly to avoid missed opportunities

**Status Impact on Earnings:**
- RUSHING: May receive rush orders with bonus points
- IDLE: Regular order flow
- BOOKED: Lower priority, but can still receive compatible orders
- IN_SERVICE: Focus on current service quality
- OFF_DUTY: No orders, protect work-life balance

### 5.3 Accepting Service Orders

**View Matched Service Requests:**

1. Navigate to **Dashboard → Service Requests → Matches**
2. See list of matched requests based on:
   - Your skills and industries
   - Location proximity (within your service radius)
   - Your availability status
   - Customer requirements
3. Each match shows:
   - Match score (0-100%)
   - Service category and title
   - Location and distance
   - Budget range
   - Urgency level
   - Request date
   - Customer information (if disclosed)

**Review Service Request Details:**

1. Click on a matched request
2. Review comprehensive details:
   - **Service Information:**
     - Title and description
     - Category and type
     - Required skills
     - Device information (if applicable)
   - **Location:**
     - Service address
     - Map view with directions
     - Distance from your current location
   - **Timeline:**
     - Preferred service date
     - Deadline
     - Estimated duration
   - **Budget:**
     - Customer's budget range
     - Currency
   - **Customer:**
     - Company name (if business)
     - Contact person
     - Phone number (revealed after acceptance)
     - Previous service history
   - **Attachments:**
     - Photos of issue/device
     - Documents
     - Videos

3. Assess if you can handle the request:
   - Do you have required skills?
   - Is location within your service area?
   - Can you meet the timeline?
   - Is budget acceptable?
   - Do you have necessary tools/equipment?

**Apply for Service Request:**

1. After reviewing, click "Apply"
2. Fill in application:
   - **Your Quote:** Proposed price for the service
   - **Estimated Duration:** How long you need
   - **Proposed Schedule:** When you can start
   - **Message to Customer:** Introduce yourself, explain your approach
   - **Attach Portfolio:** (Optional) Previous work photos, certifications
3. Click "Submit Application"
4. Application sent to customer
5. Track application status:
   - PENDING: Awaiting customer review
   - ACCEPTED: Customer accepted your application
   - REJECTED: Customer chose another expert
   - WITHDRAWN: You cancelled your application

**Alternative: Direct Assignment (Admin Assigned):**

1. Receive notification: "You have been assigned a service request"
2. View assignment details
3. You have 24 hours to:
   - **Accept:** Click "Accept Assignment" → Proceed to execution
   - **Decline:** Click "Decline" → Provide reason → Assignment returned to pool
4. If no response within 24 hours, assignment auto-expires

**After Acceptance:**

1. Service record created (ESR-YYMM-NNNNNN code)
2. Customer receives your contact information
3. Status changes to BOOKED or IN_SERVICE
4. Order appears in "My Active Services"
5. Payment hold initiated (if prepayment required)
6. You can:
   - Contact customer to confirm details
   - Schedule appointment
   - Prepare tools and materials

### 5.4 Completing Services

**Update Service Progress:**

1. Navigate to **Dashboard → My Services → Active**
2. Click on service record
3. Update status as you progress:
   - **PENDING:** Initial status after acceptance
   - **IN_PROGRESS:** Click "Start Service" when you begin work
   - **COMPLETED:** Click "Complete Service" when finished

**Document Service Work:**

1. Click "Add Service Notes"
2. Enter detailed notes:
   - Work performed
   - Issues found
   - Solutions applied
   - Parts replaced
   - Recommendations for customer
3. Upload evidence:
   - Before photos (recommended)
   - During work photos
   - After completion photos
   - Test results
   - Inspection reports
4. Record actual time:
   - Actual start time
   - Actual end time
   - (System auto-calculates duration)

**Mark Service as Complete:**

1. Ensure all work is finished and tested
2. Click "Complete Service"
3. Fill in completion form:
   - **Final Price:** If different from agreed price, explain why
   - **Completion Notes:** Summary of work done
   - **Device Status:** If device-related, update device status
     - Before service: e.g., MAINTENANCE
     - After service: e.g., IN_SERVICE
   - **Maintenance Type:** (If applicable)
     - Preventive: Regular maintenance
     - Corrective: Fault repair
     - Emergency: Urgent breakdown
     - Upgrade: Enhancement/modification
     - Inspection: Testing/verification
4. Upload final documentation
5. Click "Submit for Customer Confirmation"

**Customer Confirmation Process:**

1. Customer receives completion notification
2. Customer reviews your work and notes
3. Customer can:
   - **Confirm Completion:** Service record finalized
   - **Request Revision:** Asks for additional work or fixes
   - **Dispute:** Raises complaint (goes to admin review)
4. You receive notification of customer's action

**If Revision Requested:**
1. Review customer's revision request
2. Options:
   - **Accept:** Agree to do additional work → Status back to IN_PROGRESS
   - **Negotiate:** Discuss with customer (extra charges for out-of-scope work)
   - **Decline:** If request is unreasonable → Escalate to admin

**Upon Confirmation:**
1. Service record status: COMPLETED
2. Payment released (if held in escrow)
3. Earn points:
   - SERVICE_COMPLETED: +30 points
   - ON_TIME_COMPLETION: +10 points (if completed before deadline)
4. Customer prompted to leave review
5. Completed count incremented
6. Work status auto-changes to IDLE (if no other active services)

### 5.5 Viewing Service History

**Access Service History:**
1. Navigate to **Dashboard → My Services → History**
2. View all completed services with filters:
   - Date range
   - Service category
   - Customer
   - Device type
   - Rating received

**Service Record Details:**
- Service request code (SR-YYMM-NNNNNN)
- Expert service record code (ESR-YYMM-NNNNNN)
- Customer information
- Service category and type
- Location and date
- Agreed price vs. final price
- Duration (estimated vs. actual)
- Your notes and uploads
- Customer review and rating
- Points earned
- Status and completion date

**Performance Metrics:**
- Total services completed
- Average rating (out of 5 stars)
- Total reviews received
- On-time completion rate
- Customer satisfaction score
- Total earnings
- Points earned
- Credit level

**Download Service Report:**
1. Click on service record
2. Click "Export PDF"
3. PDF includes:
   - Service summary
   - Timeline
   - Work performed
   - Photos
   - Customer feedback
   - Your signature (digital)
   - System verification stamp
4. Use for portfolio or certification purposes

**Review Management:**
1. View reviews left by customers
2. Respond to reviews (optional):
   - Thank customers for positive reviews
   - Address concerns in negative reviews professionally
   - Admins can hide inappropriate reviews
3. Report unfair/fake reviews:
   - Click "Report Review"
   - Provide evidence of unfairness
   - Admin investigates and takes action

---

## 6. Customer Workflow

### 6.1 Viewing Devices

**Access Your Devices:**
1. Login to customer account
2. Navigate to **Dashboard → My Devices**
3. View list of all devices owned by your organization

**Device List Display:**
- Device Passport Code (with QR code icon)
- Device Name and Model
- Product Line
- Manufacturer
- Current Status
- Location
- Warranty Status
- Last Service Date
- Quick Actions (View, Request Service, Transfer)

**Filter and Search:**
- Search by: Code, name, model, manufacturer
- Filter by:
  - Product line
  - Status
  - Warranty status (Active, Expired, N/A)
  - Location
  - Service status (Needs service, Recently serviced)
- Sort by: Date added, Status, Name, Warranty expiry

**View Device Details:**

1. Click on a device from list
2. See comprehensive information:

   **Basic Information:**
   - Passport Code (clickable to view QR)
   - Device Name
   - Model Number
   - Manufacturer
   - Product Line
   - Origin Country

   **Technical Details:**
   - Specifications (JSON formatted)
   - Manufacturer Part Number
   - Serial Number
   - Manufacture Date
   - Warranty Expiry Date

   **Status and Location:**
   - Current Status
   - Current Location (with map if GPS available)
   - Last Status Update
   - Status History

   **Ownership:**
   - Supplier (original supplier)
   - Customer (your organization)
   - Purchase Date (if available)
   - Transfer History

   **Service Information:**
   - Last Service Date
   - Next Scheduled Maintenance
   - Total Services Performed
   - Service History (list)

   **Lifecycle Timeline:**
   - Visual timeline of all status changes
   - Events logged with dates and actors
   - QC inspections
   - Testing results
   - Location changes

**Download Device Information:**
1. Click "Export" on device details page
2. Choose format:
   - PDF: Comprehensive device report
   - JSON: Technical data export
   - CSV: Tabular data
3. Report includes all device info, specs, and history

**Print QR Code:**
1. Click "View QR Code"
2. QR code displayed in high resolution
3. Click "Print QR Label"
4. Select label size and format
5. Print for physical attachment to device

### 6.2 Submitting Service Requests

**Create New Service Request:**

1. Navigate to **Dashboard → Services → New Request**

2. **Choose Service Category:**
   - **Device Service:**
     - Fault Repair (equipment breakdown)
     - Regular Maintenance (scheduled servicing)
     - Device Installation (new equipment setup)
     - Inspection & Testing (performance verification)
     - Device Registration (bind existing device)
   - **Labor Service:**
     - Electrical Engineering
     - Mechanical Engineering
     - Plumbing Engineering
     - General Labor
   - **Consulting:**
     - Technical Consulting
     - Operation Training
     - Certification Support

3. **Select Device (if applicable):**
   - Option 1: Select from "My Devices" list
   - Option 2: Scan QR code to auto-select
   - Option 3: Enter passport code manually
   - Option 4: Skip (for labor/consulting services without device)

4. **Describe the Issue/Requirement:**
   - **Title:** Brief summary (max 100 chars)
   - **Common Issue Type:** (For device repair)
     - Cannot Start
     - Unexpected Stop
     - Precision Drop
     - Abnormal Sound/Vibration
     - Alarm/Error Code
     - Overheating
     - Leakage
     - Other
   - **Detailed Description:** (max 2000 chars)
     - What happened?
     - When did it start?
     - Any error codes or messages?
     - What have you tried?
     - Impact on operations

5. **Upload Supporting Materials:**
   - Photos of the issue (max 5 photos, 10MB each)
   - Videos showing the problem (max 2 videos, 50MB each)
   - Error logs or screenshots
   - Device manuals or documentation

6. **Set Service Details:**
   - **Urgency Level:**
     - Low: Non-critical, can wait
     - Normal: Standard priority
     - High: Affecting operations
     - Urgent: Production stopped, immediate help needed
   - **Preferred Time:**
     - ASAP: As soon as possible
     - This Week: Within 7 days
     - Next Week: 8-14 days
     - Flexible: No rush
     - Specific Date: Pick exact date/time
   - **Budget Range:**
     - No Limit
     - Under 500
     - 500-2000
     - 2000-5000
     - Over 5000
     - Custom: Enter your range

7. **Service Location:**
   - Address (auto-filled from device if selected)
   - Allow GPS for precise location
   - Add location notes (building, floor, access instructions)

8. **Contact Information:**
   - Auto-filled from your profile
   - Modify if different contact person needed
   - Add alternate phone number

9. **Visibility Settings:**
   - **Make Public:** Visible to all experts (recommended for faster matching)
   - **Private:** Only shown to invited/matched experts
   - **Show Company Info:** Display your company name (for credibility)

10. **Review and Submit:**
    - Review all entered information
    - Click "Save as Draft" (to finish later) OR
    - Click "Submit Request" (to publish immediately)
11. Receive Service Request Code (SR-YYMM-NNNNNN)
12. Track request status in dashboard

### 6.3 Tracking Service Progress

**View Active Service Requests:**

1. Navigate to **Dashboard → Services → Active Requests**
2. See all open and in-progress services

**Service Request Statuses:**

| Status | Description | Expected Actions |
|--------|-------------|------------------|
| DRAFT | Saved but not submitted | Complete and submit |
| OPEN | Published, waiting for experts | Review expert applications |
| IN_PROGRESS | Expert assigned and working | Monitor progress, communicate with expert |
| COMPLETED | Service finished | Confirm completion, leave review |
| CANCELLED | Request cancelled | - |
| EXPIRED | No expert found within deadline | Repost or modify |

**View Applications (When Status = OPEN):**

1. Click on service request
2. Navigate to "Applications" tab
3. See list of experts who applied:
   - Expert name and photo
   - Expert passport code
   - Rating and total reviews
   - Completed services count
   - Quote (price and duration)
   - Proposed schedule
   - Message from expert
   - Match score (how well they match requirements)

4. Compare applicants:
   - Sort by: Rating, Price, Distance, Match Score
   - Filter by: Minimum rating, Max price

5. Review each expert's profile:
   - Click on expert name
   - View full profile with certifications
   - Check service history and reviews
   - See work samples/portfolio

6. Select best expert:
   - Click "Accept Application" on chosen expert
   - System creates expert service record
   - Other applications auto-rejected
   - Expert receives acceptance notification
   - Status changes to IN_PROGRESS

**Monitor In-Progress Service:**

1. Click on in-progress service
2. View real-time updates:
   - Current status (Pending → In Progress → Completed)
   - Expert's location (if shared during service)
   - Expert's status updates and notes
   - Timeline of events

3. Communication:
   - Send message to expert
   - Call expert directly (number revealed after acceptance)
   - Receive notifications for important updates

4. Track milestones:
   - Expert accepted: ✓
   - Expert on the way: ✓
   - Service started: ✓
   - Service completed: ✓
   - Awaiting your confirmation: (Action Required)

**Receive Completion Notification:**

1. Expert marks service as complete
2. You receive notification (email + in-app)
3. Review completion details:
   - Expert's completion notes
   - Final price (compare with agreed quote)
   - Actual duration
   - Photos of completed work
   - Device status update (if applicable)
   - Test results or inspection reports

### 6.4 Leaving Reviews

**After Service Confirmation:**

1. Service status becomes COMPLETED
2. System prompts: "Please review the expert's service"
3. Navigate to **Dashboard → Services → History**
4. Click on completed service
5. Click "Leave Review" button

**Review Form:**

1. **Rating (Required):**
   - Overall Rating: 1-5 stars
   - Sub-ratings (optional):
     - Professionalism: 1-5 stars
     - Technical Skill: 1-5 stars
     - Communication: 1-5 stars
     - Timeliness: 1-5 stars
     - Value for Money: 1-5 stars

2. **Written Review (Recommended):**
   - Title: Brief summary (max 100 chars)
   - Detailed Feedback: (max 1000 chars)
     - What went well?
     - Any issues or concerns?
     - Would you recommend this expert?
     - Any suggestions for improvement?

3. **Tags (Optional):**
   - Select applicable tags:
     - Professional
     - Knowledgeable
     - On Time
     - Good Communication
     - Fair Pricing
     - Clean Work
     - Respectful
     - Problem Solver
     - Exceeded Expectations

4. **Photos (Optional):**
   - Upload photos of completed work (max 3 photos)

5. **Privacy:**
   - Post as: Your Name OR Anonymous
   - Recommendation: Use real name for credibility

6. **Submit Review:**
   - Click "Submit Review"
   - Review published immediately
   - Expert receives notification
   - You earn points (CUSTOMER_REVIEWED: +10 points)

**Review Impact:**
- Helps other customers choose experts
- Affects expert's rating and ranking
- Experts with higher ratings get priority in matching
- Fair reviews build platform trust

**Edit Review (within 7 days):**
1. Navigate to service history
2. Click on your review
3. Click "Edit"
4. Modify rating or text
5. Save changes
6. Edit history logged

**Report Inappropriate Expert Behavior:**
1. If expert was unprofessional, unsafe, or fraudulent
2. Click "Report Issue" instead of normal review
3. Select issue type:
   - Poor service quality
   - Safety violation
   - Harassment or inappropriate behavior
   - Fraud or deception
   - No-show without notice
   - Other
4. Provide detailed explanation
5. Attach evidence (photos, chat logs, etc.)
6. Submit report
7. Admin team investigates within 48 hours
8. Expert may receive penalty points or suspension

---

## 7. Marketplace Usage

The B2B marketplace connects suppliers offering products with buyers seeking equipment.

### 7.1 Publishing Products (Supplier)

**Prerequisites:**
- Supplier organization approved
- Supplier role user logged in

**Create Product Listing:**

1. Navigate to **Dashboard → Marketplace → My Products**
2. Click "Publish New Product"

3. **Basic Information:**
   - **Listing Title:** Catchy, descriptive title (max 200 chars)
     - Example: "High-Precision CNC Milling Machine - 5-Axis, German Engineering"
   - **Product Category:** Select from ProductLine enum
     - PF: Packaging Filling
     - QI: Quality Inspection
     - MP: Metal Processing
     - PP: Plastics Processing
     - HL: Hospital Lab
     - ET: Education Training
     - WL: Warehouse Logistics
     - IP: Industrial Parts
     - CS: Custom Solutions
   - **Description:** Detailed description (max 5000 chars)
     - Features and specifications
     - Applications and use cases
     - Advantages and benefits
   - **HS Code:** Harmonized System code for international trade (optional)

4. **Product Details:**
   - Select from existing supplier products OR
   - Create new supplier product:
     - Product name
     - Model number
     - Technical specifications
     - Images (up to 10 images)
     - Brochures/manuals (PDF upload)

5. **Pricing:**
   - **Show Price:** Yes/No (some suppliers prefer quote-based)
   - If showing price:
     - Minimum Price
     - Maximum Price (for price range)
     - Currency (CNY, USD, EUR, etc.)
     - Price Unit (per unit, per set, per kg, etc.)
   - **Minimum Order Quantity:** Minimum units buyer must purchase

6. **Supply Information:**
   - **Supply Region:** Country or region where you can supply from
   - **Location:** Address or GPS coordinates (for logistics calculation)
   - **Lead Time:** Number of days from order to delivery
   - **Shipping Terms:** (JSONB field)
     ```json
     {
       "FOB": "Available",
       "CIF": "Available",
       "EXW": "Available",
       "customTerms": "Negotiable for large orders"
     }
     ```

7. **Visibility Settings:**
   - **Status:**
     - DRAFT: Save without publishing
     - PENDING_REVIEW: Submit for admin review (if enabled)
     - ACTIVE: Publish immediately (if auto-approval enabled)
   - **Featured Listing:** Request featured placement (may require fee)
   - **Expiry Date:** When listing should auto-expire (optional, default 90 days)

8. **Review and Publish:**
   - Preview listing as buyers will see it
   - Check all information
   - Click "Publish"
   - Listing goes live (or pending review)
   - Receive listing ID

**Manage Published Products:**

1. View all listings in **My Products**
2. Filter by status: Active, Paused, Expired, Removed
3. For each listing:
   - View details
   - Edit information
   - Pause/Resume listing
   - Extend expiry date
   - View statistics:
     - View count
     - Inquiry count
     - Favorite count
     - Match count

**Pause Listing:**
- Temporarily hide from marketplace
- Use when product temporarily unavailable
- Can resume anytime

**Remove Listing:**
- Permanently remove from marketplace
- Cannot be recovered
- Historical inquiries remain accessible

### 7.2 Creating RFQs (Buyer)

**Prerequisites:**
- Buyer organization approved
- Buyer role user logged in

**Create Request for Quotation (RFQ):**

1. Navigate to **Dashboard → Marketplace → My RFQs**
2. Click "Create New RFQ"

3. **Basic Information:**
   - **Title:** Clear, specific title (max 200 chars)
     - Example: "Seeking PLC Controllers - Siemens S7-1200 or Equivalent"
   - **Description:** Detailed requirements (max 5000 chars)
     - Technical specifications
     - Quality standards
     - Delivery requirements
     - Payment terms
   - **Product Category:** Select applicable category
   - **HS Code:** (if known)

4. **Quantity Requirements:**
   - **Quantity:** Number of units needed
   - **Quantity Unit:** units, sets, kg, tons, etc.
   - **Purchase Frequency:**
     - One Time: Single purchase
     - Monthly: Recurring monthly
     - Quarterly: Every 3 months
     - Yearly: Annual purchase
     - As Needed: Irregular, on-demand

5. **Budget:**
   - **Budget Range:**
     - Minimum budget
     - Maximum budget
     - Currency
   - OR select "Open to Quotes" (no fixed budget)

6. **Location Preferences:**
   - **Preferred Regions:** Select countries/regions for suppliers
     - Helps match with geographically suitable suppliers
   - **Buyer Location:** Your delivery address
     - GPS coordinates (optional, for distance calculation)

7. **Timeline:**
   - **Delivery Deadline:** When you need the products
   - **Valid Until:** When this RFQ expires (default 30 days)

8. **Visibility:**
   - **Public RFQ:** Visible to all suppliers
   - **Private RFQ:** Only shown to matched suppliers
   - **Show Company Info:** Display your company details (for credibility)

9. **Review and Publish:**
   - Preview RFQ
   - Save as DRAFT or Publish as OPEN
   - Receive RFQ code

**RFQ Status Lifecycle:**

```
DRAFT → OPEN → NEGOTIATING/CLOSED → FULFILLED/CANCELLED
```

- **DRAFT:** Saved, not visible to suppliers
- **OPEN:** Published, suppliers can see and quote
- **NEGOTIATING:** Received quotes, in discussion
- **CLOSED:** Stopped accepting new quotes
- **FULFILLED:** Successfully completed purchase
- **CANCELLED:** RFQ cancelled
- **EXPIRED:** Passed validity date without fulfillment

**Manage RFQs:**

1. View all RFQs in dashboard
2. Track received quotes per RFQ
3. Edit RFQ (only if status is DRAFT or OPEN)
4. Extend validity date
5. Close RFQ (stop accepting quotes)
6. Mark as Fulfilled (when purchase completed)

### 7.3 Viewing Matches

**For Suppliers (View Matched RFQs):**

1. Navigate to **Dashboard → Marketplace → Matched Buyers**
2. See RFQs that match your products:
   - Match score (0-100%)
   - Matching based on:
     - Product category alignment
     - Location proximity
     - Budget range
     - Your product offerings
3. Filter matches:
   - Match score threshold
   - Budget range
   - Delivery timeline
   - Location

4. Click on matched RFQ to view details
5. Assess fit:
   - Can you meet specifications?
   - Can you deliver by deadline?
   - Is quantity manageable?
   - Is price acceptable?

**For Buyers (View Matched Products):**

1. Navigate to **Dashboard → Marketplace → Matched Products**
2. See products that match your RFQs:
   - Match score
   - Based on:
     - Category match
     - Specification fit
     - Budget alignment
     - Supplier location
3. Sort by:
   - Match score (highest first)
   - Price (lowest first)
   - Supplier rating
   - Lead time

4. Click on matched product to view details
5. Review supplier profile:
   - Company information
   - Certifications
   - Customer reviews
   - Transaction history

### 7.4 Sending Inquiries

**Initiate Inquiry:**

**Option 1: From Matched Product/RFQ**
1. View match details
2. Click "Send Inquiry" button

**Option 2: Direct Product Inquiry**
1. Browse marketplace products
2. Find interesting product
3. Click "Inquire Now"

**Option 3: From Saved Items**
1. Navigate to saved products/suppliers
2. Click "Send Inquiry"

**Compose Inquiry:**

1. Auto-filled information:
   - Inquiry Code (INQ-{YEAR}-{SEQUENCE})
   - Related product or RFQ
   - Your organization
   - Recipient organization

2. Fill in inquiry details:
   - **Subject:** Clear inquiry purpose (auto-suggested)
   - **Message:** Detailed inquiry (max 2000 chars)
     - Introduction
     - Specific questions
     - Additional requirements
   - **Quantity:** Units you're interested in
   - **Target Price:** Your desired price (optional)
   - **Required Delivery Date:** When you need it
   - **Attach Files:** Specifications, drawings, samples (optional)

3. Review and send
4. Inquiry appears in your "Sent Inquiries"
5. Supplier receives notification

**Inquiry Statuses:**

| Status | Description |
|--------|-------------|
| PENDING | Sent, awaiting supplier response |
| RESPONDED | Supplier replied |
| NEGOTIATING | Ongoing discussion |
| ACCEPTED | Agreement reached |
| REJECTED | Declined by either party |
| EXPIRED | No response within timeframe |

**Track Inquiries:**

1. Navigate to **Dashboard → Marketplace → Inquiries**
2. Tabs:
   - **Sent:** Inquiries you sent to suppliers
   - **Received:** Inquiries you received (if you're supplier)
3. View inquiry details:
   - Status
   - Messages exchanged
   - Quotes/counter-offers
   - Timeline
4. Filter by status, date, product

### 7.5 Negotiating

**Message Thread:**

1. Click on inquiry
2. View conversation history
3. Each message shows:
   - Sender
   - Message type (Message, Quote, Counter-offer, etc.)
   - Timestamp
   - Attachments

**Send Reply:**

1. Type message in reply box
2. Select message type:
   - **MESSAGE:** General communication
   - **QUOTE:** Formal price quotation
   - **COUNTER_OFFER:** Alternative proposal
   - **ACCEPTANCE:** Agree to terms
   - **REJECTION:** Decline offer

**Send Quote (Supplier):**

1. Click "Send Quote" button
2. Fill in quotation form:
   - **Product/Service:** What you're offering
   - **Quantity:** Units
   - **Unit Price:** Price per unit
   - **Total Price:** Auto-calculated
   - **Currency:** CNY, USD, EUR, etc.
   - **Payment Terms:**
     - Deposit required (%)
     - Payment method
     - Payment schedule
   - **Delivery Terms:**
     - Lead time (days)
     - Shipping method
     - Incoterms (FOB, CIF, EXW, etc.)
   - **Validity:** Quote valid until date
   - **Additional Terms:** Special conditions
   - **Attach Documents:**
     - Detailed quotation PDF
     - Product specifications
     - Certificates
3. Click "Send Quote"
4. Buyer receives formal quotation

**Counter Offer (Buyer):**

1. Receive quote from supplier
2. Click "Counter Offer"
3. Modify terms:
   - Propose different price
   - Request different quantity
   - Change delivery terms
   - Add/modify conditions
4. Explain reasoning in message
5. Send counter offer
6. Supplier reviews and responds

**Negotiation Best Practices:**

- Be professional and respectful
- Respond promptly (within 24-48 hours)
- Be clear about your requirements
- Ask questions to clarify ambiguities
- Document agreements in writing
- Use formal quote/counter-offer for important terms
- Attach supporting documents (specs, certifications)
- Negotiate in good faith

**Accept Offer:**

1. Review final terms
2. Click "Accept Offer"
3. Confirm acceptance
4. Inquiry status → ACCEPTED
5. Both parties notified
6. Next steps:
   - Move to formal contract (outside platform, or use platform integration if available)
   - Arrange payment
   - Coordinate logistics
7. Mark inquiry as "Converted to Order" (optional)

**Reject Offer:**

1. Click "Reject"
2. Provide reason (optional but courteous)
3. Inquiry status → REJECTED
4. Both parties notified
5. Inquiry closed

**Save for Later:**

- Click "Save to Favorites"
- Supplier/Product saved to your saved items
- Inquiry remains active for future reference

---

## 8. Points System

The platform uses a dual-point system:
1. **Reward Points:** Spendable currency for benefits
2. **Credit Score:** Reputation score affecting ranking and privileges

### 8.1 Earning Points

**For Experts:**

| Action | Reward Points | Credit Score | Description |
|--------|---------------|--------------|-------------|
| SERVICE_COMPLETED | +30 | +30 | Complete a service successfully |
| ON_TIME_COMPLETION | +10 | +10 | Complete service before deadline |
| FIVE_STAR_REVIEW | +50 | +50 | Receive 5-star rating from customer |
| CUSTOMER_CONFIRMED | +15 | +15 | Customer confirms service completion |
| DEVICE_INSPECTION | +30 | +30 | Complete device inspection/verification |
| CERTIFICATE_UPLOADED | +30 | +30 | Upload verified professional certificate |
| DAILY_LOGIN_STREAK_7 | +20 | +0 | Login consecutively for 7 days |
| DAILY_LOGIN_STREAK_30 | +100 | +0 | Maintain 30-day activity streak |
| IDENTITY_VERIFIED | +100 | +50 | Complete real-name identity verification |

**For Customers:**

| Action | Reward Points | Credit Score | Description |
|--------|---------------|--------------|-------------|
| PUBLISH_SERVICE | +10 | +0 | Publish a service request |
| FIRST_PUBLISH | +50 | +10 | First time publishing service request |
| SERVICE_MATCHED | +20 | +0 | Service request successfully matched with expert |
| CUSTOMER_REVIEWED | +10 | +5 | Leave review for completed service |
| DEVICE_TAKEOVER | +50 | +10 | Successfully register/takeover a device |

**For All Users:**

| Action | Reward Points | Credit Score | Description |
|--------|---------------|--------------|-------------|
| INVITE_REGISTER | +100 | +20 | Invite new user who completes registration |
| INVITEE_FIRST_ORDER | +200 | +50 | Invited user completes first transaction |

**How Points Are Awarded:**

1. Automated triggers based on actions
2. Points credited immediately after action verification
3. Notification sent to user
4. Points reflected in account balance
5. Transaction recorded in point history

**View Your Points:**

1. Navigate to **Dashboard → Points → My Points**
2. See current balances:
   - Reward Points (spendable)
   - Credit Score (reputation)
   - Credit Level (tier based on score)
3. View breakdown:
   - Total earned (lifetime)
   - Total spent (lifetime)
   - Total penalties (lifetime)
   - Current balance

### 8.2 Using Points

**Redemption Options:**

1. **Service Discounts:**
   - Use reward points to pay for services
   - Typical exchange: 100 points = $1 USD equivalent
   - Apply during service payment

2. **Membership Upgrades (Experts):**
   - Upgrade to Silver: 1000 reward points
   - Upgrade to Gold: 3000 reward points
   - Upgrade to Diamond: 8000 reward points
   - Upgraded memberships last 1 year

3. **Featured Listings:**
   - Boost marketplace product visibility
   - Cost: 200 points for 7 days featured
   - Higher placement in search results

4. **Priority Support:**
   - Get priority customer support
   - Cost: 50 points per priority ticket
   - Faster response times

5. **Training Courses:**
   - Access premium training materials
   - Costs vary: 100-500 points per course
   - Certificates upon completion

6. **Promotional Credits:**
   - Redeem for advertising credits
   - Promote your services/products
   - 500 points = $5 ad credit

**How to Redeem:**

1. Navigate to **Dashboard → Points → Redeem**
2. Browse available redemption options
3. Select desired item/service
4. Click "Redeem"
5. Confirm points deduction
6. Points deducted, benefit activated
7. Transaction logged in history

**Points Expiration:**
- Reward points expire after 2 years if inactive
- Credit score does not expire
- Receive reminder 30 days before expiration

### 8.3 Credit Levels

Credit levels are calculated from credit score and affect platform privileges.

**Credit Level Tiers:**

| Level | Score Range | Badge Color | Benefits |
|-------|-------------|-------------|----------|
| BRONZE | 0 - 199 | Bronze | Basic access, standard matching |
| SILVER | 200 - 499 | Silver | +5% higher matching priority, early access to features |
| GOLD | 500 - 999 | Gold | +10% matching priority, reduced platform fees (5%), dedicated support |
| PLATINUM | 1000 - 1999 | Platinum | +20% matching priority, reduced fees (10%), featured profile badge, priority review of applications |
| DIAMOND | 2000+ | Diamond | +30% matching priority, reduced fees (15%), VIP support, exclusive opportunities, verified expert badge |

**Leveling Up:**

1. Earn credit score through positive actions
2. System automatically calculates level
3. Level updates immediately upon threshold crossing
4. Notification sent when you level up
5. New benefits activated automatically

**Credit Score Impact:**

- **Expert Matching:** Higher credit experts shown first to customers
- **Trust Signal:** Credit level badge displayed on profile
- **Privileges:** Access to exclusive features and lower fees
- **Visibility:** Higher-ranked profiles in directory and searches

**Maintaining Credit:**

- Continue completing services successfully
- Maintain high ratings
- Avoid penalties (cancellations, complaints, late completions)
- Stay active on platform
- Engage professionally with customers/suppliers

### 8.4 Membership Tiers (Experts Only)

In addition to credit levels, experts can have membership tiers affecting service capacity.

**Membership Levels:**

| Tier | Monthly Fee | Max Concurrent Services | Benefits |
|------|-------------|------------------------|----------|
| STANDARD | Free | 1 | Basic features, standard commission |
| SILVER | 500 points OR $50 | 3 | +2 concurrent services, reduced commission (5% off) |
| GOLD | 1500 points OR $100 | 5 | +4 concurrent services, reduced commission (10% off), priority matching |
| DIAMOND | 3000 points OR $200 | 10 | +9 concurrent services, reduced commission (15% off), priority + featured placement, VIP support |

**How Concurrent Services Work:**

- STANDARD: Can accept 1 service at a time
  - Must complete before accepting new service
- SILVER: Can accept up to 3 services simultaneously
  - Schedule and juggle multiple appointments
- GOLD: Up to 5 concurrent services
- DIAMOND: Up to 10 concurrent services

**Upgrade Membership:**

1. Navigate to **Dashboard → Membership**
2. View current tier and benefits
3. Click "Upgrade"
4. Choose new tier
5. Select payment method:
   - Pay with reward points
   - Pay with payment method (credit card, etc.)
6. Confirm upgrade
7. Membership activated immediately
8. Valid for 1 year from activation date

**Membership Auto-Renewal:**
- Enable auto-renewal to avoid expiration
- Charged automatically 7 days before expiration
- Email reminder sent 14 days before renewal
- Can cancel anytime before renewal date

**Downgrade Membership:**
- Can downgrade anytime
- No refund for remaining time
- Downgrade effective at next renewal date
- OR immediate downgrade with partial refund

---

## 9. Troubleshooting

### 9.1 Common Issues

#### Login Problems

**Issue: Forgot Password**
- **Solution:**
  1. Click "Forgot Password" on login page
  2. Enter registered email
  3. Check email inbox (and spam folder)
  4. Click reset link within 1 hour
  5. Create new password
  6. Login with new credentials

**Issue: Account Locked**
- **Cause:** Too many failed login attempts (5+ within 15 minutes)
- **Solution:**
  1. Wait 30 minutes for auto-unlock
  2. OR click "Forgot Password" to reset immediately
  3. Contact support if problem persists

**Issue: Email Not Received**
- **Solution:**
  1. Check spam/junk folder
  2. Add noreply@devicepassport.com to contacts
  3. Verify email address is correct in profile
  4. Request new verification email
  5. Contact support if still not received after 24 hours

#### QR Code Scanning Issues

**Issue: QR Code Not Recognized**
- **Solution:**
  1. Ensure good lighting on QR code
  2. Clean camera lens
  3. Hold device steady, 10-30cm from code
  4. Ensure QR code is not damaged or distorted
  5. Try manual code entry instead
  6. Update browser/app to latest version

**Issue: "Device Not Found" Error**
- **Cause:** Code might be misread or device not in system
- **Solution:**
  1. Verify code manually (check all characters)
  2. Re-enter code carefully
  3. Contact device manufacturer or supplier
  4. Report issue to admin if device should exist

#### Service Request Problems

**Issue: No Experts Responding**
- **Causes:**
  - Request too specific/restrictive
  - Budget too low
  - Location too remote
  - Urgency conflicting with timeline
- **Solutions:**
  1. Increase budget range
  2. Extend timeline/reduce urgency
  3. Make request public (if private)
  4. Broaden service category/requirements
  5. Add more location flexibility
  6. Contact admin for manual matching

**Issue: Can't Submit Service Request**
- **Solution:**
  1. Check all required fields are filled
  2. Ensure file uploads are under size limit (10MB per file)
  3. Verify valid email format
  4. Try different browser
  5. Clear browser cache and cookies
  6. Disable browser extensions temporarily
  7. Contact technical support

#### Payment Issues

**Issue: Payment Failed**
- **Solution:**
  1. Verify card details (number, expiry, CVV)
  2. Ensure sufficient funds
  3. Check if card allows international transactions
  4. Try different payment method
  5. Contact your bank/card issuer
  6. Use alternative payment (bank transfer, PayPal, etc.)
  7. Contact platform finance team

**Issue: Points Not Credited**
- **Solution:**
  1. Refresh page
  2. Check point transaction history for status
  3. Verify action was completed fully (e.g., service confirmed)
  4. Wait 24 hours (some points have delay)
  5. Contact support with transaction details

### 9.2 Error Messages

#### Authentication Errors

**"Invalid Credentials"**
- Meaning: Email or password incorrect
- Fix: Double-check email and password, use password reset if needed

**"Account Not Activated"**
- Meaning: Registration pending admin approval
- Fix: Wait for approval email, or contact admin for status update

**"Account Suspended"**
- Meaning: Account blocked due to violation or security issue
- Fix: Contact support to understand reason and appeal if applicable

**"Session Expired"**
- Meaning: You've been inactive too long
- Fix: Login again, session timeout is 24 hours

#### Permission Errors

**"Access Denied - Insufficient Permissions"**
- Meaning: Your role doesn't have access to this feature
- Fix: Contact admin to request appropriate role/permissions

**"Organization Verification Required"**
- Meaning: Organization not yet verified
- Fix: Complete organization verification process, submit documents

#### Data Errors

**"Invalid Passport Code Format"**
- Meaning: Code doesn't match DP-XXX-YYMM-XX-XX-NNNNNN-XX format
- Fix: Check code for typos, ensure all segments present

**"Device Already Exists"**
- Meaning: Passport code already in system
- Fix: Search for existing device, or contact admin if duplicate

**"Status Transition Not Allowed"**
- Meaning: Can't change from current status to requested status
- Fix: Follow valid status flow (e.g., can't go from CREATED directly to DELIVERED)

#### File Upload Errors

**"File Too Large"**
- Meaning: File exceeds maximum size (usually 10MB)
- Fix: Compress file, or split into multiple smaller files

**"Invalid File Type"**
- Meaning: File format not supported
- Fix: Convert to supported format (JPG, PNG, PDF for most uploads)

**"Upload Failed"**
- Meaning: Network issue or server error during upload
- Fix: Check internet connection, try again, reduce file size

### 9.3 Support Contact

**For Technical Support:**
- **Email:** support@devicepassport.com
- **Live Chat:** Available on dashboard (9 AM - 6 PM CST, Mon-Fri)
- **Phone:** +86-XXX-XXXX-XXXX (Business hours)
- **Response Time:**
  - Critical issues: 2 hours
  - High priority: 4 hours
  - Normal: 24 hours

**For Business Inquiries:**
- **Email:** business@devicepassport.com
- **Sales:** sales@devicepassport.com

**For Urgent Issues (Production Down):**
- **Hotline:** +86-XXX-XXXX-XXXX (24/7)
- Mark service request as "URGENT"
- Use priority support (50 points)

**Support Ticket System:**

1. Navigate to **Dashboard → Support → New Ticket**
2. Fill in ticket form:
   - **Category:** Technical, Account, Billing, Feature Request, Other
   - **Priority:** Low, Normal, High, Critical
   - **Subject:** Brief description
   - **Description:** Detailed explanation
   - **Attachments:** Screenshots, error logs
3. Submit ticket
4. Receive ticket number
5. Track status in **My Tickets**
6. Receive email updates on progress

**Self-Service Resources:**
- **Help Center:** dashboard → Help → Knowledge Base
- **Video Tutorials:** dashboard → Help → Tutorials
- **API Documentation:** https://api.devicepassport.com/docs
- **Developer Forum:** https://forum.devicepassport.com

---

## 10. FAQ

### General Questions

**Q1: What is the Device Passport System?**

A: The Device Passport System is a comprehensive B2B platform for equipment lifecycle management. It uses digital passports (QR codes) to track devices from manufacturing through their entire operational life, including procurement, quality control, assembly, testing, delivery, service, and maintenance. The platform also facilitates expert service matching, B2B marketplace trading, and customer engagement.

**Q2: Who can use this system?**

A: The system serves multiple user types:
- **Manufacturers/Suppliers:** Create and manage device passports, track products
- **Buyers/Customers:** Purchase equipment, request services, track device history
- **Technical Experts:** Provide repair, maintenance, and installation services
- **Business Experts:** Offer consulting, training, and certification support
- **Service Engineers:** Execute service orders
- **Quality Inspectors:** Perform QC inspections
- **Operators:** Manage daily operations
- **Admins:** Oversee platform operations

**Q3: Is there a mobile app?**

A: Currently, the platform is web-based with full mobile browser support. A Progressive Web App (PWA) can be installed on mobile devices for app-like experience. Native iOS and Android apps are in development roadmap (Phase 3).

**Q4: What languages are supported?**

A: The platform currently supports:
- English (primary)
- Chinese (Simplified)
Additional languages may be added based on demand.

**Q5: Is my data secure?**

A: Yes. The platform implements:
- SSL/TLS encryption for all data transmission
- Encrypted storage for sensitive data
- Role-based access control (RBAC)
- Regular security audits
- GDPR-compliant data handling
- Blockchain integration (planned) for immutable audit trails

### Account & Registration

**Q6: How long does registration approval take?**

A:
- **Companies:** 1-3 business days (may take longer if additional verification needed)
- **Experts:** 2-5 business days (depends on certificate verification)
- You'll receive email notification once approved

**Q7: Can I register both as a Supplier and Buyer?**

A: Yes! During company registration, select "Both" in the company role section. Your organization will have access to both supplier and buyer features.

**Q8: Can I have multiple users under one organization?**

A: Yes. After your organization is approved, the admin can create additional user accounts with different roles (viewer, operator, admin, etc.). Navigate to Dashboard → Users → Invite User.

**Q9: I registered but haven't received activation email. What should I do?**

A:
1. Check spam/junk folder
2. Verify you entered correct email during registration
3. Wait 24 hours (approval may be pending)
4. Contact support@devicepassport.com with your registration details

**Q10: Can I change my organization after registration?**

A: No, you cannot change your organization yourself. Contact admin support with justification, and they can assist with organization transfer if valid reason provided.

### Device Passports

**Q11: What is a Device Passport Code?**

A: A unique identifier for each device in the format:
`DP-{COMPANY}-{YYMM}-{PRODUCT}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}`

Example: `DP-MED-2601-PF-CN-000001-A7`

Components:
- **DP:** Prefix for Device Passport
- **MED:** Company code (3 letters)
- **2601:** Year-Month (Jan 2026)
- **PF:** Product line (Packaging Filling)
- **CN:** Origin country (China)
- **000001:** Sequence number
- **A7:** Checksum for validation

**Q12: Can I create device passports for existing equipment?**

A: Yes, through the Device Takeover process:
1. Submit service request with category "Device Registration"
2. Provide device details and photos
3. Expert inspects device (optional)
4. Admin reviews and creates passport
5. You receive passport code and QR label

**Q13: What information is visible to the public when someone scans my device?**

A: Public information includes:
- Device name and model
- Manufacturer
- Product line and origin
- Current status
- Manufacture date
- Warranty status

Sensitive information (customer name, location, full service history, specifications) is only visible to authorized users.

**Q14: Can I transfer device ownership?**

A: Yes. Navigate to device details → Transfer Ownership. Enter new customer's organization ID or email. New customer must accept transfer. Transfer is logged in lifecycle history.

**Q15: What happens if my device QR code is damaged?**

A:
1. Login and search device by name/serial number
2. Navigate to device details
3. Click "Regenerate QR Code"
4. Download and print new QR label
The passport code remains the same; only QR code is reprinted.

### Services & Experts

**Q16: How are service costs determined?**

A:
- Customers can set budget ranges in service requests
- Experts provide quotes based on:
  - Complexity of work
  - Time required
  - Materials needed
  - Travel distance
  - Urgency level
- Final price negotiated between customer and expert
- Platform does not set fixed prices

**Q17: What if the expert doesn't show up?**

A:
1. Contact expert via phone/message first
2. Wait 30 minutes beyond scheduled time
3. If no response, click "Report No-Show"
4. Admin investigates
5. Expert penalized (-40 credit points for NO_SHOW)
6. Service reassigned to another expert
7. You may receive compensation credits

**Q18: Can I cancel a service request?**

A: Yes, depending on status:
- **OPEN (not assigned):** Cancel anytime, no penalty
- **ASSIGNED (expert accepted):**
  - Free cancellation if >24 hours before scheduled time
  - -30 credit points if <24 hours (CANCEL_ORDER_CUSTOMER penalty)
  - Contact expert directly for last-minute changes
- **IN_PROGRESS:** Cannot cancel, must complete or dispute

**Q19: What if I'm not satisfied with the service?**

A:
1. Request revision from expert (within service scope)
2. If unresolved, refuse to confirm completion
3. File dispute with detailed explanation and evidence
4. Admin reviews within 48 hours
5. Possible outcomes:
   - Expert does additional work to resolve
   - Partial/full refund issued
   - Expert penalized if at fault
   - Mediated resolution

**Q20: How do I become a verified expert?**

A:
1. Complete expert registration with all required documents
2. Upload professional certificates (diplomas, licenses, training certificates)
3. Pass admin review
4. Complete identity verification (ID/passport upload)
5. Complete first 3 services successfully with avg rating >4.0
6. Receive "Verified Expert" badge on profile

### Marketplace

**Q21: Are there fees for using the marketplace?**

A:
- **Listing products:** Free (basic listings)
- **Featured listings:** 200 points for 7 days
- **Transaction fees:**
  - Standard: 5% of transaction value
  - Silver members: 4.75%
  - Gold members: 4.5%
  - Platinum members: 4.25%
  - Diamond members: 4%
- **RFQs:** Free to post and respond

**Q22: Can I negotiate prices directly with suppliers/buyers?**

A: Yes! The platform encourages direct negotiation:
1. Send inquiry
2. Supplier responds with quote
3. You can counter-offer
4. Negotiate until agreement
5. Finalize terms
6. Execute transaction (on or off platform)

**Q23: Does the platform handle payments and logistics?**

A: Currently:
- **Payments:** Platform supports escrow for service payments. For marketplace transactions, parties arrange payment directly (platform payment integration coming in Phase 4)
- **Logistics:** Parties coordinate logistics directly. Platform provides matching and communication tools.

**Q24: How do I know if a supplier is legitimate?**

A: Check:
- **Verified Badge:** Supplier has completed verification
- **Business License:** Uploaded and verified by admin
- **Registration Date:** How long they've been on platform
- **Transaction History:** Past deals (if available)
- **Reviews:** Feedback from other buyers
- **Response Rate:** How quickly they respond to inquiries
- **Company Profile:** Detailed company information
Perform your own due diligence for large transactions.

**Q25: Can I save products or suppliers to review later?**

A: Yes! Click the "Save" or "Favorite" button on:
- Product listings
- Supplier profiles
- RFQs
Access saved items via Dashboard → Saved Items.

### Points & Membership

**Q26: Do reward points expire?**

A: Yes, reward points expire after 2 years of inactivity. You'll receive reminder 30 days before expiration. Use points within validity period or they'll be forfeited.

**Q27: Can I transfer points to another user?**

A: No, points are non-transferable. They're tied to your individual account and cannot be sold, transferred, or exchanged outside the platform.

**Q28: How is credit score different from reward points?**

A:
- **Reward Points:** Currency for redemptions (services, memberships, features). Can be spent.
- **Credit Score:** Reputation metric affecting ranking and privileges. Cannot be spent, only earned through good behavior and lost through penalties.

**Q29: If I get penalized, do I lose both reward points and credit score?**

A: Depends on the action:
- Most penalties deduct **credit score only** (e.g., CANCEL_ORDER_EXPERT: -50 credit)
- Some severe violations may deduct both
- Reward points are typically not deducted, only credit score
- Check point rules for specific action

**Q30: What happens to my points if my account is suspended?**

A:
- Points remain in your account
- Cannot redeem while suspended
- If suspension lifted, full access restored
- If permanently banned, points forfeited

### Technical

**Q31: What browsers are supported?**

A:
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
Older browsers may work but not officially supported.

**Q32: Can I use the platform offline?**

A: Limited offline functionality:
- Installed PWA can cache recently viewed data
- QR scanning requires internet connection for lookup
- Most features require active internet connection
Full offline support not available currently.

**Q33: Is there an API for integration?**

A: Yes! API documentation available at:
https://api.devicepassport.com/docs

API access requires:
- Approved organization
- API key (request via Dashboard → Settings → API)
- Developer role or admin approval

**Q34: Can I export my data?**

A: Yes. Navigate to Dashboard → Settings → Data Export:
- **Device data:** Export CSV/JSON of all devices
- **Service history:** Export service records
- **Point transactions:** Export point history
- **Full account data:** Request via support (GDPR compliance)

**Q35: How do I report a bug or request a feature?**

A:
1. Dashboard → Support → Report Bug/Feature Request
2. Provide detailed description
3. Attach screenshots if applicable
4. Submit
5. Track status in your support tickets
6. Vote on other users' feature requests in community forum

---

## Appendix A: Product Line Descriptions

| Code | Name | Description |
|------|------|-------------|
| PF | Packaging Filling | Automated packaging and filling solutions for various industries |
| QI | Quality Inspection | Advanced inspection and testing systems for quality assurance |
| MP | Metal Processing | Precision metalworking machinery and automation for cutting, welding, stamping |
| PP | Plastics Processing | Automated systems for injection molding, extrusion, blow molding |
| HL | Hospital Lab | Automation solutions for medical and laboratory environments |
| ET | Education Training | Training systems and simulators for industrial automation education |
| WL | Warehouse Logistics | Smart logistics and warehouse automation including AS/RS, conveyors, AGVs |
| IP | Industrial Parts | High-quality mechanical and electrical components: motors, drives, sensors, controllers |
| CS | Custom Solutions | Bespoke automation systems engineered to meet unique client requirements |

## Appendix B: Country/Origin Codes

| Code | Country |
|------|---------|
| CN | China |
| DE | Germany |
| JP | Japan |
| US | United States |
| KR | South Korea |
| TW | Taiwan |
| IT | Italy |
| FR | France |
| GB | United Kingdom |
| CH | Switzerland |
| VN | Vietnam |
| OTHER | Custom origin (manual entry required) |

## Appendix C: Expert Skills Reference

### Automation Skills
- **PL** - PLC Programming
- **HM** - HMI Design
- **RB** - Robotics
- **MC** - Motion Control
- **VS** - Vision Systems
- **IO** - IoT/Industrial IoT

### Electromechanical Skills
- **ED** - Electrical Design
- **EI** - Electrical Installation
- **MD** - Mechanical Design
- **MI** - Mechanical Installation
- **HD** - Hydraulics
- **WD** - Welding

### Instrumentation Skills
- **IS** - Instrumentation
- **NT** - Networks
- **SC** - Safety Systems

### Software Skills
- **SW** - Software Development
- **AI** - AI/Machine Learning

### Service Skills
- **MN** - Maintenance
- **CM** - Commissioning
- **PM** - Project Management

## Appendix D: Service Request Categories

### Device Services
- **DEVICE_REPAIR** - Fault Repair
- **DEVICE_MAINTENANCE** - Regular Maintenance
- **DEVICE_INSTALLATION** - Device Installation
- **DEVICE_INSPECTION** - Inspection & Testing
- **DEVICE_TAKEOVER** - Device Registration/Binding

### Labor Services
- **LABOR_ELECTRICAL** - Electrical Engineering
- **LABOR_MECHANICAL** - Mechanical Engineering
- **LABOR_PLUMBING** - Plumbing Engineering
- **LABOR_GENERAL** - General Labor

### Consulting Services
- **CONSULTING_TECHNICAL** - Technical Consulting
- **CONSULTING_TRAINING** - Operation Training
- **CONSULTING_CERTIFICATION** - Certification Support

---

**Document Version:** 1.0
**Publication Date:** February 2026
**Platform:** Device Passport Traceability System
**Support:** support@devicepassport.com
**Website:** https://devicepassport.com

*This manual is subject to updates. Check the platform for the latest version.*
