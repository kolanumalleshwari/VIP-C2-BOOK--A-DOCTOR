<div align="center">

# 🩺 MediConnect Pro™
### A Full-Stack MERN Enterprise Healthcare Practice & Appointment Management Platform

*Seamless. Secure. Scalable.*

---

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Live Deployments](#-live-deployments)
- [Protected Credentials](#-protected-credentials)
- [Feature Highlights](#-feature-highlights)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Phase-Wise Documentation](#-phase-wise-documentation)
- [Deployment Guide](#-deployment-guide)

---

## 🌟 Overview

**MediConnect Pro™** is a production-ready, enterprise-grade full-stack MERN practice management software. Built with a decoupled **Model-View-Controller (MVC)** architecture, the application features an advanced doctor matchmaking directory, scheduling pipelines, telemedicine integration, and telemetry analytics logs.

The platform provides a comprehensive workflow where patients can discover and book doctor slots, doctors can manage their consultation schedule calendars, admins handle directory moderation, and super admins inspect telemetry dashboards and system audit logs.

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | SPA with virtual DOM, HMR dev server |
| **Styling** | Tailwind CSS 3 | Utility-first responsive styling and HSL tailored layout |
| **Routing** | React Router DOM 6 | Declarative routes with protected role-based guards |
| **State Management** | Redux Toolkit (RTK) | Global centralized state store (auth, appointments, payments) |
| **Calendar** | FullCalendar | Multi-view scheduling grid for practitioner availability slots |
| **Charts** | Chart.js + react-chartjs-2 | Interactive dashboard analytics and active retention logs |
| **HTTP Client** | Axios | REST API communications with automatic refresh token rotation |
| **Backend** | Node.js + Express.js | RESTful API, validation middleware, business logic |
| **Database** | MongoDB + Mongoose | NoSQL document storage with Mongoose schemas |
| **Real-time** | Socket.io | Push notifications for instant appointment updates |
| **PDF compiler** | Puppeteer-core | HTML-to-PDF invoice compiler for medical prescriptions |

---

## 🌐 Live Deployments

You can access the live deployment of the application:
- 🌐 [MediConnect Pro™ Web Application (Vercel)](https://frontend-olive-chi-70.vercel.app/)
- ⚙️ [Backend REST API (Render)](https://vip-c2-book-a-doctor.onrender.com)

---

## 👥 Protected Credentials (Autofill Demo Accounts)

To speed up evaluation, the Login page contains a **Fast Credentials Autofill** tab. You can click any role tab to populate:

- **Super Admin** (Track platform-wide analytics & audit logs):
  - Email: `superadmin@mediconnect.com`
  - Password: `Admin@123`
- **Admin** (Manage directory listings & specialty categories):
  - Email: `admin@mediconnect.com`
  - Password: `Admin@123`
- **Doctor** (Consultations calendar, approve/reject appointments, prescription drawer):
  - Email: `doctor1@mediconnect.com`
  - Password: `Admin@123`
- **Patient** (Clinic slot bookings, simulated payment checkouts, upload files to locker):
  - Email: `patient1@mediconnect.com`
  - Password: `Admin@123`

---

## ✨ Feature Highlights

### 🔐 Authentication & Session Security
- Stateless JWT authentication using two-token architecture (Access & Refresh tokens).
- **Refresh Token Rotation (RTR)** interceptor automatically updates tokens silently on expiration.
- Role-Based Access Control (RBAC) with protected route guards for Patient, Doctor, Admin, and Super Admin.

### 🩺 Doctor Discovery & Scheduling
- Advanced practitioner directory with multi-tier filters (Specialty, price range, hospital branch, star rating).
- Live scheduling calendar showing available slots dynamically based on active doctor calendars.
- Status workflows for appointments: `Pending` -> `Confirmed` -> `Completed` / `Cancelled` / `No Show`.

### 📂 Medical Locker & Prescription Compiler
- Secure digital record locker allowing patients to upload lab tests, scans, or general documents.
- Interactive Prescription Drawer for doctors to write prescriptions, advice, and dosages.
- **HTML-to-PDF dynamic engine** compiling prescription invoices into downloadable PDFs.

### 💳 Simulated Payments Checkout
- Itemized payment checkout wizard for clinic consultations.
- Simulated payment charging endpoint tracking transactions.
- Automated ledger recording invoices under patient billing profiles.

### 🖥️ Analytics & Audit Telemetry
- Interactive telemetry dashboards showcasing revenue growth, cancellations, and doctor retention rates using Chart.js.
- Platform-wide operational audit log tracking login events, data creation, and status revisions.

---

## 🛠️ Project Structure

The repository is structured as a decoupled monorepo:
- [frontend/](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/frontend): React.js frontend client SPA built with Vite.
- [backend/](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/backend): Node.js/Express.js backend REST API.

---

## 🚀 Quick Start

### Prerequisites
1. Local MongoDB server running on port `27017` (using default data directories).
2. Node.js (v18+) and npm installed.

### 1. Database Seeding
Navigate to the `backend` folder and run the database seeder to populate 50+ doctors, 100+ patients, and 6 months of billing records:
```bash
cd backend
npm install
node seed.js
```

### 2. Start Backend Server
Start the Express API server on port `5000`:
```bash
node server.js
```

### 3. Start Client Dev Server
Navigate to the `frontend` folder, install dependencies, and launch Vite dev server on port `3000`:
```bash
cd ../frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📂 Phase-Wise Documentation

All the official project design artifacts, schemas, and diagrams are included directly in the root of the repository:
- 📋 [FSD Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/FSD_Documentation.pdf) - Full Stack Development (FSD) technical reference report, complete with system architecture, ER diagrams, UML class diagrams, and API routing references.
- 📋 [MedConnect FSD Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/MedConnect_FSD_Documentation.pdf) - Project planning and additional structural documents.

---

## ⚙️ Deployment Guide

### Deploying the Backend to Render
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository `kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR`.
4. Configure the Web Service settings:
   - **Name**: `vip-c2-book-a-doctor`
   - **Root Directory**: `backend`
   - **Environment/Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
   - `JWT_SECRET`: A secure key for token signing (e.g. `your_secret_key`)
   - `JWT_REFRESH_SECRET`: A secure key for token rotation (e.g. `your_refresh_secret`)
6. Click **Deploy Web Service**. Render will build and deploy your backend.

### Deploying the Frontend to Vercel
1. In your terminal, navigate to the `frontend/` directory.
2. Run `vercel --prod` to trigger a production deployment.
3. Bind the environment variable `VITE_API_URL` to point to your live Render backend service URL.
