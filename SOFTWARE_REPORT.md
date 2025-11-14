# Local Government QR Code Attendance Management System (LG-QAMS)

## Software Report & User Guide

---

**Version:** 1.0  
**Date:** January 2025  
**Document Type:** Software Report & User Guide

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Features](#system-features)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema](#database-schema)
6. [User Guide](#user-guide)
7. [Administrator Guide](#administrator-guide)
8. [Installation & Setup](#installation--setup)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)
11. [Security Features](#security-features)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The Local Government QR Code Attendance Management System (LG-QAMS) is a comprehensive web-based attendance tracking solution designed specifically for local government organizations. The system digitizes the traditional attendance management process through QR code technology, providing real-time tracking, automated reporting, and role-based access control.

### Key Highlights

- **QR Code-Based Check-In/Out**: Streamlined attendance recording using QR codes
- **Real-Time Dashboard**: Live attendance statistics and monitoring
- **Automated Reporting**: Generate monthly, departmental, and individual reports
- **Role-Based Access**: Separate interfaces for administrators and staff
- **Office Hours Validation**: Enforce attendance rules based on configured office hours
- **Data Export**: PDF and CSV export capabilities for reports

---

## Project Overview

### Purpose

LG-QAMS was developed to replace manual attendance tracking systems in local government organizations, providing:

- Accurate and real-time attendance tracking
- Reduced administrative overhead
- Automated report generation
- Compliance with attendance policies
- Data-driven insights for workforce management

### Technology Stack

- **Frontend**: Pure JavaScript (ES6+), Vite build tool
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **Design System**: Flowbite (standalone CSS/JS)
- **Routing**: Client-side routing using History API
- **Export**: jsPDF for PDF generation, native CSV export

### System Architecture

The application follows a Single Page Application (SPA) architecture with:

- Modular component structure
- Service-based API integration
- Client-side routing
- Responsive design for all devices

---

## System Features

### 1. Authentication & Authorization

#### Features

- Email and password-based authentication
- Role-based access control (Admin, Staff)
- Secure session management
- Automatic sign-out on security violations
- Password visibility toggle for better UX

#### User Roles

**Admin:**

- Full system access
- Staff management
- Attendance monitoring
- Report generation
- System settings configuration
- No check-in/out required

**Staff:**

- Personal dashboard
- Check-in/out functionality
- Personal attendance history
- Monthly reports
- Profile management

### 2. Attendance Management

#### Check-In/Out Process

1. Staff scans QR code or navigates to check-in page
2. Enters email and password
3. System validates:
   - Office hours compliance
   - Single check-in/out per day rule
   - User authentication
   - Role restrictions (admins cannot check in/out)
4. Records attendance with timestamp
5. Displays success confirmation

#### Features

- **QR Code Generation**: Automatic QR code for check-in page
- **Office Hours Validation**: Enforces attendance during configured hours
- **Late Detection**: Automatically flags late arrivals
- **Single Entry Rule**: Prevents duplicate check-ins per day
- **Real-Time Updates**: Instant reflection on dashboards

### 3. Staff Management (Admin Only)

#### Features

- **Auto-Generated Staff IDs**: Format LGUSR001 (Staff) or LGADM001 (Admin)
- **CRUD Operations**: Create, read, update, and deactivate staff
- **Department Management**: Assign staff to departments
- **Email Synchronization**: Automatic sync with authentication system
- **Status Management**: Activate/deactivate staff accounts
- **Search & Filter**: Find staff quickly
- **Pagination**: Handle large staff lists efficiently

### 4. Dashboard Features

#### Admin Dashboard

- **Today's Statistics**:
  - Present count
  - Absent count (synced with office hours)
  - Late arrivals
  - Total staff count
- **Today's Attendance List**:
  - Staff name and department
  - Check-in time
  - Check-out time
  - Status (Present/Absent)
- **Pagination**: Navigate through attendance records

#### Staff Dashboard

- **Personal Statistics**:
  - Present days (current month)
  - Absences (excludes weekends, synced with office hours)
  - Lateness count
  - Total working days
- **Recent Attendance**: Last 5 attendance records
- **Quick Actions**: Access to reports and profile

### 5. Reporting & Analytics

#### Report Types

**Monthly Reports:**

- Department-wide or all departments
- Attendance summary for the selected month
- Staff-wise breakdown

**Departmental Reports:**

- All staff in a department (or all departments)
- Comparative analysis
- Attendance patterns

**Individual Staff Reports:**

- Personal attendance history
- Detailed statistics
- Export to PDF or CSV

#### Features

- **PDF Export**: Professional formatted reports
- **CSV Export**: Data analysis in spreadsheet software
- **Report History**: View previously generated reports
- **Pagination**: Navigate through report history

### 6. System Settings (Admin Only)

#### Configurable Settings

- **Office Hours**: Start and end times
- **Late Threshold**: Minutes after start time considered late
- **Data Backup**: Export all system data as JSON
- **Data Restore**: Import data from backup file

---

## Technical Architecture

### Project Structure

```
lg-qams/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── header/          # Navigation header
│   │   ├── qr-code/         # QR code generator
│   │   └── attendance-card/ # Statistics cards
│   ├── pages/               # Page templates
│   │   ├── public/          # Public pages (home, login, scan, checkin)
│   │   ├── staff/           # Staff pages (dashboard, attendance, reports, profile)
│   │   └── admin/           # Admin pages (dashboard, staff, attendance, reports, settings)
│   ├── services/            # API service modules
│   │   ├── auth.js          # Authentication
│   │   ├── staff.js           # Staff management
│   │   ├── attendance.js     # Attendance tracking
│   │   ├── reports.js         # Report generation
│   │   ├── settings.js        # System settings
│   │   ├── backup.js          # Data backup
│   │   └── restore.js         # Data restore
│   ├── utils/               # Utility functions
│   │   ├── router.js         # Client-side routing
│   │   ├── dashboard-init.js # Dashboard initialization
│   │   ├── qr-code-init.js   # QR code initialization
│   │   ├── password-init.js   # Password toggle initialization
│   │   └── ...              # Other page-specific utilities
│   ├── styles/              # CSS files
│   │   ├── flowbite.css      # Flowbite components
│   │   ├── flowbite-tokens.css # Design tokens
│   │   ├── variables.css     # CSS variables
│   │   └── main.css          # Global styles
│   ├── guards/              # Route guards
│   │   └── auth-guard.js     # Authentication guard
│   └── main.js              # Application entry point
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── dist/                    # Build output
├── package.json             # Dependencies
└── vercel.json              # Deployment config
```

### Key Technologies

#### Frontend

- **Vite**: Fast build tool and dev server
- **Pure JavaScript**: No framework dependencies
- **Flowbite**: Design system components
- **History API**: Client-side routing

#### Backend

- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Relational database
- **Row Level Security**: Data access control
- **Database Triggers**: Automated data synchronization

### Data Flow

1. **User Action** → Frontend component
2. **Service Layer** → API call to Supabase
3. **Database** → Query execution with RLS
4. **Response** → Data returned to frontend
5. **UI Update** → Component re-renders

---

## Database Schema

### Tables

#### 1. `staff`

Stores staff member information.

| Column       | Type             | Description                           |
| ------------ | ---------------- | ------------------------------------- |
| id           | UUID             | Primary key                           |
| staff_id     | TEXT             | Auto-generated ID (LGUSR001/LGADM001) |
| auth_user_id | UUID             | Foreign key to auth.users             |
| name         | TEXT             | Full name                             |
| email        | TEXT             | Email address (synced with auth)      |
| department   | TEXT             | Department name                       |
| role         | user_role ENUM   | Admin or Staff                        |
| status       | user_status ENUM | active or inactive                    |
| created_at   | TIMESTAMP        | Creation timestamp                    |
| updated_at   | TIMESTAMP        | Last update timestamp                 |

#### 2. `attendance`

Stores daily attendance records.

| Column         | Type                   | Description             |
| -------------- | ---------------------- | ----------------------- |
| id             | UUID                   | Primary key             |
| staff_id       | UUID                   | Foreign key to staff.id |
| date           | DATE                   | Attendance date         |
| check_in_time  | TIMESTAMP              | Check-in timestamp      |
| check_out_time | TIMESTAMP              | Check-out timestamp     |
| status         | attendance_status ENUM | Present, Absent, Late   |
| is_late        | BOOLEAN                | Late arrival flag       |
| created_at     | TIMESTAMP              | Creation timestamp      |

#### 3. `settings`

Stores system configuration.

| Column     | Type      | Description                        |
| ---------- | --------- | ---------------------------------- |
| id         | UUID      | Primary key                        |
| key        | TEXT      | Setting key (e.g., 'office_hours') |
| value      | JSONB     | Setting value                      |
| updated_at | TIMESTAMP | Last update timestamp              |

#### 4. `reports`

Stores generated report metadata.

| Column      | Type      | Description                       |
| ----------- | --------- | --------------------------------- |
| id          | UUID      | Primary key                       |
| staff_id    | UUID      | Foreign key (optional)            |
| report_type | TEXT      | monthly, departmental, individual |
| month       | DATE      | Report month                      |
| department  | TEXT      | Department name (optional)        |
| created_at  | TIMESTAMP | Creation timestamp                |

### ENUM Types

- **user_role**: `Admin`, `Staff`
- **user_status**: `active`, `inactive`
- **attendance_status**: `Present`, `Absent`, `Late`

### Database Features

- **Auto-Generated Staff IDs**: Trigger generates LGUSR001/LGADM001 format
- **Email Sync Trigger**: Syncs staff.email to auth.users.email
- **Row Level Security**: Policies enforce data access rules
- **Indexes**: Optimized queries for performance

---

## User Guide

### Getting Started

#### For Staff Members

1. **Access the System**
   - Navigate to the LG-QAMS URL
   - You'll see the home page

2. **Login**
   - Click "Login" in the navigation
   - Enter your email and password
   - Click "Login" button
   - You'll be redirected to your dashboard

3. **First Time Setup**
   - Contact your administrator to receive:
     - Your email address (login credential)
     - Your temporary password
     - Your Staff ID (e.g., LGUSR001)

### Staff User Guide

#### Dashboard

**Accessing Your Dashboard:**

- After login, you're automatically taken to your dashboard
- Navigate using the "Dashboard" link in the navigation bar

**Understanding Your Dashboard:**

- **Present Days**: Number of days you've checked in this month
- **Absences**: Days you were absent (excludes weekends)
- **Lateness**: Number of times you arrived late
- **Total Working Days**: Total weekdays in the month (up to today)

**Recent Attendance:**

- View your last 5 attendance records
- Shows date, check-in time, and status

#### Checking In/Out

**Method 1: Using QR Code**

1. Click "Scan QR" in the navigation (public users)
2. Scan the QR code with your mobile device
3. You'll be redirected to the check-in page
4. Enter your email and password
5. Click "Check In" or "Check Out"
6. View confirmation message

**Method 2: Direct Access**

1. Navigate to the check-in page directly
2. Enter your email and password
3. Click "Check In" or "Check Out"
4. View confirmation message

**Important Notes:**

- You can only check in/out during office hours
- You can only check in once per day
- You must check in before checking out
- If you're late, the system will mark you as late

**Troubleshooting Check-In/Out:**

- **"Office hours not started yet"**: Wait until office hours begin
- **"Already checked in today"**: You've already checked in; check out first
- **"Already checked out today"**: You've already completed check-out
- **"Admins cannot check in/out"**: Contact administrator if you see this error

#### Viewing Attendance History

1. Click "Attendance" in the navigation
2. View your attendance records in a table
3. Filter by:
   - Date range (start date, end date)
   - Status (Present, Absent, Late)
4. Click "Apply Filter" to see results
5. Click "Reset" to clear filters
6. Use pagination to navigate through records

#### Generating Reports

1. Click "Reports" in the navigation
2. Select a month from the dropdown
3. Click "Generate Report"
4. View your monthly statistics:
   - Total working days
   - Present days
   - Absences
   - Lateness
   - Average check-in time
   - Average check-out time
5. Download options:
   - **PDF**: Click "Download PDF" for formatted report
   - **Excel**: Click "Download Excel" for CSV file

**Report History:**

- View all previously generated reports
- Reports are saved automatically
- Access them anytime from the Reports page

#### Managing Your Profile

1. Click "Profile" in the navigation
2. **Update Personal Information:**
   - Edit your name
   - Update your email (contact admin for email changes)
   - Click "Update Profile"
   - Confirm changes with "Yes"
3. **Change Password:**
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Change Password"
   - Confirm with "Yes"

**Profile Settings:**

- Changes require confirmation
- Email changes may require admin approval
- Password must meet security requirements

#### Logging Out

1. Click "Logout" button in the navigation bar
2. You'll be signed out and redirected to the home page

---

## Administrator Guide

### Getting Started

#### Initial Setup

1. **Access Admin Account**
   - Login with admin credentials
   - You'll see the admin dashboard

2. **Configure System Settings**
   - Navigate to "Settings"
   - Set office hours (start and end time)
   - Set late threshold (minutes)
   - Click "Save Settings"

### Admin User Guide

#### Dashboard

**Understanding the Admin Dashboard:**

- **Present Today**: Number of staff who checked in today
- **Absent Today**: Number of staff absent (synced with office hours)
- **Late Today**: Number of late arrivals
- **Total Staff**: Total number of active staff

**Today's Attendance List:**

- View all staff who checked in today
- See check-in and check-out times
- See department information
- Use pagination to navigate through records

**Important Notes:**

- Admins are excluded from attendance tracking
- Newly created staff (created today) are excluded from absence count
- Absence count syncs with office hours (0 before office hours start)

#### Staff Management

**Adding New Staff:**

1. Navigate to "Staff" in the navigation
2. Click "Add Staff" button
3. Fill in the form:
   - **Name**: Full name of staff member
   - **Email**: Email address (used for login)
   - **Department**: Select from dropdown or enter new
   - **Role**: Select Staff or Admin
   - **Staff ID**: Auto-generated (LGUSR001 or LGADM001)
4. Click "Add Staff"
5. System will:
   - Create authentication account
   - Generate staff ID automatically
   - Set default password (share with staff)
6. Note the generated Staff ID and default password

**Editing Staff:**

1. Find the staff member in the table
2. Click "Edit" button
3. Update information:
   - Name
   - Email (syncs with auth automatically)
   - Department
   - Role
4. Click "Update Staff"
5. Changes are saved immediately

**Deactivating Staff:**

1. Find the staff member in the table
2. Click "Deactivate" button
3. Confirm with "Yes"
4. Staff account is deactivated
5. They cannot login or check in/out

**Reactivating Staff:**

1. Find the deactivated staff member
2. Click "Activate" button
3. Confirm with "Yes"
4. Staff account is reactivated

**Searching Staff:**

- Use the search box to find staff by name, email, or staff ID
- Results update as you type
- Click "Clear" to reset search

**Pagination:**

- Navigate through staff list using pagination controls
- View 10 staff per page by default

#### Attendance Records

**Viewing Attendance:**

1. Navigate to "Attendance" in the navigation
2. View all attendance records in a table
3. Filter by:
   - **Date Range**: Start date and end date
   - **Department**: Select specific department or "All Departments"
   - **Staff ID**: Enter staff ID to filter
4. Click "Apply Filter" to see results
5. Click "Reset" to clear all filters

**Exporting Attendance Data:**

1. Apply any desired filters
2. Click "Export Data" button
3. CSV file downloads automatically
4. Open in Excel or Google Sheets for analysis

**Pagination:**

- Navigate through records using pagination
- View 10 records per page by default

#### Reports & Analytics

**Generating Reports:**

1. Navigate to "Reports" in the navigation
2. Select report type:
   - **Monthly Report**: Department-wide summary
   - **Departmental Report**: All staff in a department
   - **Individual Staff Report**: Single staff member (uses department selection)
3. Select month from dropdown
4. Select department (optional - can select "All Departments")
5. Click "Generate Report"
6. Report is generated and saved automatically

**Report Types Explained:**

- **Monthly Report**: Shows attendance summary for a department (or all departments) for the selected month
- **Departmental Report**: Detailed breakdown of all staff in a department (or all departments) for the selected month
- **Individual Staff Report**: Uses department selection to generate reports for all staff in that department

**Viewing Generated Reports:**

- All generated reports appear in the "Generated Reports" section
- View report details:
  - Report type
  - Month
  - Department
  - Generation date
- Reports are displayed in a grid (2 columns, 5 per column)
- Use pagination to navigate through reports

**Report Cards:**

- Each report card shows:
  - Report type label
  - Month (formatted)
  - Department name
  - Generation date

#### System Settings

**Configuring Office Hours:**

1. Navigate to "Settings" in the navigation
2. Set **Start Time**: When office hours begin (e.g., 08:00)
3. Set **End Time**: When office hours end (e.g., 17:00)
4. Click "Save Office Hours"
5. Settings are saved immediately

**Setting Late Threshold:**

1. In Settings page
2. Set **Late Threshold**: Minutes after start time considered late (e.g., 15)
3. Click "Save Late Threshold"
4. Settings are saved immediately

**Data Backup:**

1. Click "Backing up data" button
2. System exports all data as JSON file
3. File downloads automatically
4. Store backup securely

**Data Restore:**

1. Click "Restore Data" button
2. Select backup JSON file
3. Click "Restore"
4. Confirm restoration
5. System imports data from backup

**Important Notes:**

- Office hours affect check-in/out validation
- Late threshold determines late arrival detection
- Backups should be performed regularly
- Restore operations overwrite existing data

#### Logging Out

1. Click "Logout" button in the navigation bar
2. You'll be signed out and redirected to the home page

---

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account
- Git (for version control)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd lg-qams
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref <your-project-ref>

   # Run migrations
   supabase db push
   ```

3. **Configure Environment Variables**
   - Create `.env` file in project root:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Step 4: Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Deployment Guide

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Redeploy**
   - Changes to environment variables require redeployment

### Netlify Deployment

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**

   ```bash
   netlify deploy --prod
   ```

3. **Configure Environment Variables**
   - Netlify dashboard → Site settings → Environment variables

### Cloudflare Pages

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Add environment variables in dashboard

### Important Notes

- Ensure `vercel.json` (or equivalent) is configured for SPA routing
- All routes should redirect to `index.html`
- Environment variables must be set in hosting platform
- Database migrations must be run on Supabase

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"

**Solution:**

- Check environment variables are set correctly
- Verify Supabase project is active
- Check network connectivity

#### 2. "Row-level security policy violation"

**Solution:**

- Ensure user is authenticated
- Check user role matches required permissions
- Verify RLS policies are correctly configured
- Run database migrations

#### 3. "Staff cannot check in/out"

**Possible Causes:**

- Office hours not started yet
- Already checked in/out today
- User is an admin (admins cannot check in/out)
- Authentication failed

**Solution:**

- Check office hours in Settings
- Verify user role is "Staff"
- Check authentication status
- Review error message for specific issue

#### 4. "Navigation bar shows wrong menu"

**Solution:**

- Clear browser cache
- Sign out and sign in again
- Check authentication state

#### 5. "Reports not generating"

**Solution:**

- Verify month is selected
- Check department selection (if required)
- Ensure user has admin role
- Check browser console for errors

#### 6. "Data not loading on page refresh"

**Solution:**

- This is normal for SPAs
- Data loads when navigating to the page
- Check network tab for API errors
- Verify Supabase connection

#### 7. "Email changes not syncing"

**Solution:**

- Database trigger should sync automatically
- Verify migration 015 is applied
- Check Supabase logs for trigger errors
- Manually update if needed

### Getting Help

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **Check Supabase Logs**
   - Go to Supabase dashboard
   - Check Logs section
   - Review database and auth logs

3. **Verify Database Migrations**
   - Ensure all migrations are applied
   - Check migration status in Supabase

4. **Contact Administrator**
   - For account issues
   - For system configuration
   - For access problems

---

## Security Features

### Authentication Security

- **Secure Password Storage**: Passwords are hashed by Supabase Auth
- **Session Management**: Automatic session expiration
- **CSRF Protection**: Built into Supabase
- **Email Verification**: Optional email confirmation

### Data Security

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access**: Different permissions for Admin and Staff
- **Secure API Keys**: Environment variables for sensitive data
- **HTTPS Only**: All connections encrypted

### Access Control

- **Route Guards**: Protected routes require authentication
- **Role Validation**: Admin-only features are protected
- **Automatic Sign-Out**: On security violations
- **Password Visibility Toggle**: Prevents shoulder surfing

### Best Practices

- **Regular Backups**: Perform data backups regularly
- **Strong Passwords**: Enforce password policies
- **Regular Updates**: Keep dependencies updated
- **Monitor Logs**: Review system logs regularly

---

## Future Enhancements

### Planned Features

1. **Public Holidays Exclusion**
   - Configure public holidays
   - Exclude from working days calculation
   - Automatic absence adjustment

2. **Advanced Analytics**
   - Trend analysis
   - Attendance patterns
   - Predictive insights

3. **Mobile Application**
   - Native iOS/Android apps
   - Push notifications
   - Offline support

4. **Email Notifications**
   - Daily attendance reminders
   - Late arrival alerts
   - Monthly report summaries

5. **Multi-Tenant Support**
   - Multiple organizations
   - Organization-specific settings
   - Data isolation

6. **Biometric Integration**
   - Fingerprint recognition
   - Face recognition
   - Enhanced security

7. **Integration APIs**
   - HR systems
   - Payroll systems
   - Time tracking tools

---

## Appendix

### A. Staff ID Format

- **Staff**: LGUSR001, LGUSR002, LGUSR003, ...
- **Admin**: LGADM001, LGADM002, LGADM003, ...
- **Auto-Generated**: System automatically generates IDs
- **Gap Filling**: Reuses deleted ID numbers

### B. Office Hours Logic

- **Check-In**: Allowed only during office hours
- **Check-Out**: Allowed after office hours end
- **Late Detection**: Based on late threshold setting
- **Absence Calculation**: Syncs with office hours start time

### C. Working Days Calculation

- **Excludes Weekends**: Saturday and Sunday not counted
- **Current Month**: Only counts days up to today
- **New Staff**: Counts from staff creation date
- **Office Hours Sync**: Excludes today if office hours haven't started

### D. Report Generation Logic

- **Monthly Report**: Department-wide summary
- **Departmental Report**: All staff in department
- **Individual Report**: Uses department selection
- **All Departments**: Can generate for all departments

### E. Database Migrations

Key migrations:

- `001_create_enums.sql`: ENUM type definitions
- `002_create_tables.sql`: Table creation
- `004_enable_rls.sql`: Row Level Security
- `015_sync_staff_email_to_auth.sql`: Email sync trigger
- `016_generate_staff_id.sql`: Auto ID generation

---

## Document Information

**Prepared By:** Development Team  
**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Current

---

**End of Document**
