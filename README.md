# MediConnect Pro™ — Enterprise Healthcare Practice Management Platform

MediConnect Pro™ is a production-ready, enterprise-grade full-stack MERN practice management software. Built using React.js (Vite), Redux Toolkit, Node.js (Express), and MongoDB Atlas/Mongoose, the application features an advanced doctor matchmaking directory, scheduling pipelines, telemedicine integration, and analytics logs.

---

## 🎨 Design System Heading Color Guide
To maintain premium SaaS branding, all page headers and dashboard cards utilize custom tailwind configurations targeting the strict branding palette:
* **Main Headings**: `#0F172A`
* **Section Headings**: `#0E7490`
* **Dashboard Headings**: `#4338CA`
* **Card Titles**: `#1E293B`
* **Highlights (Accents)**: `#14B8A6`

---

## 👥 Multi-Role Protected Dashboards (RBAC)
1. **Patient Dashboard**: Manage clinic slot bookings, simulated checkouts, upload files to the medical locker, view doctor advice, and download PDF prescriptions.
2. **Doctor Dashboard**: Manage consultations calendar schedules (FullCalendar), approve/reject appointments requests, earn billing aggregations, lookup patient locker file records, and generate prescription invoices.
3. **Admin Dashboard**: Manage practitioner directory listings, configure medical specialty categories, and moderate patient feedback reviews.
4. **Super Admin Dashboard**: Track platform-wide Chart.js analytics telemetry (revenue growth, cancellation statistics, active retention graphs), inspect administrative operations audit logs, and toggles global platform settings.

---

## 🔐 Credentials Autofill (Demo Testing accounts)
To speed up evaluation, the Login page contains a **Fast Credentials Autofill** tab. You can click any role tab to populate:
* **Super Admin**: `superadmin@mediconnect.com` | `Admin@123`
* **Admin**: `admin@mediconnect.com` | `Admin@123`
* **Doctor**: `doctor1@mediconnect.com` | `Admin@123`
* **Patient**: `patient1@mediconnect.com` | `Admin@123`

---

## 🚀 Execution & Deployment Guide

### Option A: Local Development Run (Recommended)

#### Prerequisites
1. Local MongoDB server running on port `27017` (using default data directories).
2. Node.js (v18+) and npm installed.

#### Step 1: Database Seeding
Navigate to the `backend` folder and run the database seeder to populate 50+ doctors, 100+ patients, and 6 months of billing records:
```bash
cd backend
npm install
node seed.js
```

#### Step 2: Start Backend Server
Start the Express API server on port `5000`:
```bash
node server.js
```

#### Step 3: Start Client Dev Server
Navigate to the `frontend` folder, install dependencies, and launch Vite dev server on port `3000`:
```bash
cd ../frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option B: Docker Containers Orchestration

You can run the entire MERN stack using Docker Compose:
```bash
docker-compose up --build
```
This builds and sets up:
* MongoDB container on port `27017`
* Node Express API container on port `5000`
* Vite React container (served via Nginx) on port `3000`
