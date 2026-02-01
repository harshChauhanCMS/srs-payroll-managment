# SRS Payroll Management System

## Overview

SRS Payroll Management is a comprehensive web application designed to streamline HR operations, payroll processing, and employee management. The system supports multiple user roles with strict access controls, ensuring secure and efficient management of organizational data.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: JavaScript (React 19)
- **UI Component Library**: [Ant Design (v6)](https://ant.design/)
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit & Redux Persist
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT-based Auth with Role-Based Access Control (RBAC)
- **Icons**: Ant Design Icons

## core Features

### 1. Role-Based Access Control (RBAC)

The application implements strict route protection and dynamic navigation based on user roles:

- **Admin**: Full system access, including configuration and master data management.
- **HR**: Employee management, attendance tracking, and payroll processing.
- **Employee**: Personal dashboard, attendance view, and payslip access.

### 2. Module Breakdown

#### Admin Portal (`/admin`)

- **System Dashboard**: High-level overview of system metrics.
- **User & Role Management**: Create and manage users (Admin, HR, Employee) with granular permissions.
- **Organization Masters**:
  - **Company**: Manage parent companies.
  - **Site**: Manage different work sites/locations.
  - **Department**: Manage departments, designations, grades, and skills.

#### HR Portal (`/hr`)

- **HR Dashboard**: Statistics on employees, departments, and active sites.
- **Employee Management**: Dedicated view to onboard and manage employee profiles.
- **Attendance Management**: (In-Progress) Tools for tracking daily attendance.
- **Payroll Processing**: (In-Progress) Salary calculation and generation.

#### Employee Portal (`/employee`)

- **Personal Dashboard**: Welcome screen with quick stats (Leave balance, Attendance %).
- **My Attendance**: View personal attendance records.
- **My Payslips**: Download and view monthly payslips.

## Project Structure

```
src/
├── app/                  # Next.js App Router Pages
│   ├── (main)/           # Authenticated Routes (Layout with Sidebar)
│   │   ├── admin/        # Admin-specific pages
│   │   ├── hr/           # HR-specific pages
│   │   └── employee/     # Employee-specific pages
│   ├── api/              # Backend API Routes
│   └── page.js           # Login / Landing Page
├── components/           # Reusable UI Components (Sidebar, Table, etc.)
├── models/               # Mongoose Database Models (User, Company, Dept, etc.)
├── hooks/                # Custom React Hooks (useAuth, getQuery, etc.)
├── redux/                # Redux Store Configuration
└── utils/                # Helper utilities (dbConnect, storage, etc.)
```

## Setup & Installation

1.  **Prerequisites**: Node.js (v18+), MongoDB instance.
2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
3.  **Environment Variables**: Configure `.env` with `MONGODB_URI`, `JWT_SECRET`, etc.
4.  **Run Development Server**:
    ```bash
    pnpm run dev
    ```

## Future Roadmap

- [ ] Complete implementation of Attendance Logic.
- [ ] Automate Payroll Calculations.
- [ ] Advanced Reporting & Analytics.
