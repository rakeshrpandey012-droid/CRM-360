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

---

## 🚢 Deployment Guide

### Deploying Backend (Render / Railway)
1. Push repository to GitHub.
2. In Render or Railway, create a new **Web Service** with root directory `server`.
3. Set environment variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your-mongodb-atlas-connection-string`
   - `JWT_SECRET`: `your_secure_random_key`
   - `JWT_REFRESH_SECRET`: `your_secure_refresh_key`
4. Build command: `npm install`
5. Start command: `node server.js`

### Deploying Frontend (Vercel)
1. In Vercel, import repository and set root directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL.
