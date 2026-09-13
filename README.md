# CRM360: Production-Ready MERN SaaS Platform

A modern, full-stack Customer Relationship Management (CRM) platform built for small-to-midsize businesses and enterprise sales teams.

---

## 🚀 Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Redux Toolkit + React Router v7 + Axios + React Hook Form + Recharts + Lucide Icons
- **Backend**: Node.js + Express.js + MongoDB + Mongoose + JWT Authentication + bcryptjs + Helmet + CORS + Rate Limiter
- **Database Support**: Out-of-the-box zero-config in-memory MongoDB fallback with auto-seeding, or external MongoDB Atlas connection.

---

## 🔑 Pre-Seeded Demo Accounts

For grading, testing, or quick evaluation, the login screen includes **1-Click Quick Login** buttons:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@crm360.com` | `Password@123` | Full access, user management, delete rights |
| **Sales Manager** | `manager@crm360.com` | `Password@123` | Pipeline management, task delegation, team analytics |
| **Sales Executive** | `sales@crm360.com` | `Password@123` | Lead qualification, customer tracking, task execution |

---

## ⚡ Quick Start (Run Locally)

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
*Note: If local MongoDB is not running, the server automatically boots an in-memory MongoDB server and seeds realistic demo data.*
Backend runs on **http://localhost:5000** (Health check at `/api/health`).

### 2. Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**.

---

## 🌟 Core Features by Phase

### Phase 1 - Authentication & Role-Based Access Control
- JWT authentication with access token (24hr) and refresh token (7 days).
- Secure password hashing with `bcryptjs` (min 8 chars, 1 uppercase, 1 number, 1 special character).
- Three role tiers: **Admin**, **Sales Manager**, and **Sales Executive**.
- User profile management and password change.
- Forgot password & password reset token flow.

### Phase 2 - Customer & Lead Management
- **Customer CRUD**: Create, read, update, and soft-delete customer records.
- **Search & Filter**: Real-time debounced search by name, email, or company. Status filter (Active/Inactive).
- **Pagination**: 10 items per page with page navigation.
- **Customer Detail & Timeline**: View customer history and log interactions (Notes, Calls, Meetings, Emails).
- **1-Click Lead Conversion**: Convert qualified leads into customers with one click, automatically updating deal stage to "Closed Won".

### Phase 3 - Sales Pipeline & Tasks
- **Interactive Kanban Board**: 6 sales pipeline stages (`New` → `Contacted` → `Qualified` → `Proposal Sent` → `Won` → `Lost`).
- Drag or dropdown advance through stages with deal value tracking.
- Toggle between **Kanban View** and **Table View**.
- **Task Management**: Filter by status (`Todo`, `In Progress`, `Completed`) and priority (`Urgent`, `High`, `Medium`, `Low`).
- **Bulk Operations**: Multi-select tasks and bulk reassign to any team member.

### Phase 4 - Executive Dashboard & Notifications
- **Executive Metrics**: Total Customers (+ trend), Active Leads (+ trend), Pending & Urgent Tasks, Closed Won Deals & Revenue.
- **Visual Analytics**:
  - Monthly Revenue Performance vs Quota (Area Chart).
  - Pipeline Stage Distribution (Donut Chart).
  - Lead Generation Channels (Bar Chart).
  - Sales Rep Performance Table.
- **In-App Notification Center**: Top navbar bell with unread badge counter, popover listing alerts for assigned leads, urgent deadlines, and new tasks, with "Mark all read".

---

## 🌐 API Endpoints Summary

- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh-token`
  - `POST /api/auth/forgot-password`
  - `PUT /api/auth/reset-password/:token`
  - `GET /api/auth/me`
  - `PUT /api/auth/updatedetails`
  - `PUT /api/auth/updatepassword`
- **Users**:
  - `GET /api/users`
  - `GET /api/users/:id`
- **Customers**:
  - `GET /api/customers` (paginated, filtered, searchable)
  - `POST /api/customers`
  - `GET /api/customers/:id`
  - `PUT /api/customers/:id`
  - `DELETE /api/customers/:id` (soft delete)
  - `POST /api/customers/:id/activities`
- **Leads**:
  - `GET /api/leads`
  - `POST /api/leads`
  - `GET /api/leads/:id`
  - `PUT /api/leads/:id`
  - `PUT /api/leads/:id/status`
  - `PUT /api/leads/:id/assign`
  - `POST /api/leads/:id/convert` (1-click conversion)
  - `POST /api/leads/:id/activities`
  - `DELETE /api/leads/:id`
- **Tasks**:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PUT /api/tasks/:id`
  - `PUT /api/tasks/:id/status`
  - `POST /api/tasks/bulk-assign`
  - `DELETE /api/tasks/:id`
- **Dashboard**:
  - `GET /api/dashboard/stats`
  - `GET /api/dashboard/pipeline`
  - `GET /api/dashboard/revenue`
  - `GET /api/dashboard/team`
  - `GET /api/dashboard/lead-sources`
- **Notifications**:
  - `GET /api/notifications`
  - `PUT /api/notifications/:id/read`
  - `PUT /api/notifications/read-all`
- **Team & Roles**:
  - `GET /api/users`
  - `POST /api/users` (Admin / Manager create team member)
  - `GET /api/users/:id`
  - `PUT /api/users/:id/role` (Admin update user role)
  - `DELETE /api/users/:id` (Admin remove team member)

---

## 🚢 Vercel Deployment Guide

### Option 1: Fullstack 1-Click Monorepo on Vercel (Recommended)
You can deploy both the React frontend and the Express API serverless functions directly on Vercel in one single step:
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Keep the **Root Directory** as `./` (default).
4. Vercel will automatically detect `vercel.json` and build:
   - React 19 Frontend: Served statically from `client/dist`.
   - Express Backend: Deployed as Serverless Functions handling `/api/*`.
5. Under **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random key (e.g., `crm360_production_key_2026`)
   - `JWT_REFRESH_SECRET`: A secure random refresh key
   - `NODE_ENV`: `production`
6. Click **Deploy**. Your CRM is live on a single URL with zero CORS setup!

### Option 2: Decoupled Deployment (Frontend on Vercel + Backend on Render/Railway)
If you prefer running a persistent background Node server on Render or Railway:
1. **Deploy Backend**:
   - In Render/Railway, create a **Web Service** with Root Directory: `server`.
   - Build Command: `npm install`, Start Command: `node server.js`.
   - Set `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`.
2. **Deploy Frontend on Vercel**:
   - In Vercel, import repository with Root Directory set to `client`.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`, Output Directory: `dist`.
   - Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.

---

## 📋 PDF Requirements Compliance Checklist

| Requirement | Implementation Details | Status |
|---|---|---|
| **1. User Authentication** | Registration, Login, JWT access/refresh tokens, Forgot Password, Reset Password, User Profile & Password Update | ✅ 100% Complete |
| **2. Role Management** | 3 User Tiers (Admin, Sales Manager, Sales Executive), Dedicated Team page (`/team`), RBAC Matrix table, Admin Role Switcher, Member Invite | ✅ 100% Complete |
| **3. Customer Management** | CRUD, search & status filter, pagination, Customer Details modal, interaction timeline logging (Notes, Calls, Meetings, Emails) | ✅ 100% Complete |
| **4. Lead Management** | Lead directory, contact info, lead source tracking, notes, 1-click lead-to-customer conversion | ✅ 100% Complete |
| **5. Sales Pipeline** | Dedicated 6-Stage Kanban Board (`/pipeline`): `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`, stage value totals, deal cards, stage advancement | ✅ 100% Complete |
| **6. Task Management** | Create, assign, due dates, priority tiers (Urgent, High, Medium, Low), status toggles, multi-select bulk reassignment | ✅ 100% Complete |
| **7. Dashboard** | Executive metrics, Total Customers (+ trend), Active Leads (+ trend), Pending & Urgent Tasks, Closed Won Deals & Revenue, Revenue Trend, Pipeline Distribution, Lead Sources, Sales Rep Table | ✅ 100% Complete |
| **8. Notifications** | Topbar Notification Center, unread counter badge, automated alerts for assigned tasks, lead updates, and upcoming deadlines (< 48h) | ✅ 100% Complete |
| **Non-Functional** | Responsive mobile/desktop layout, Plus Jakarta Sans typography, dark mode sidebar, modular code architecture, Vercel ready | ✅ 100% Complete |
