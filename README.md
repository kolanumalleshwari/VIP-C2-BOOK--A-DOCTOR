# MediConnect Pro™ — Enterprise Healthcare Appointment & Practice Management Platform

MediConnect Pro™ is a production-ready, enterprise-grade full-stack MERN practice management software. Built using React.js (Vite), Redux Toolkit, Node.js (Express), and MongoDB Atlas/Mongoose, the application features an advanced doctor matchmaking directory, scheduling pipelines, telemedicine integration, and analytics logs.

You can access the live deployment of the application:
- 🌐 [MediConnect Pro™ Web Application (Vercel)](https://frontend-olive-chi-70.vercel.app/)
- ⚙️ [Backend REST API (Render)](https://vip-c2-book-a-doctor.onrender.com) (Deploy instructions below)

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

## 🎨 Design System Heading Color Guide
To maintain premium SaaS branding, all page headers and dashboard cards utilize custom configurations targeting the strict branding palette:
* **Main Headings**: `#0F172A`
* **Section Headings**: `#0E7490`
* **Dashboard Headings**: `#4338CA`
* **Card Titles**: `#1E293B`
* **Highlights (Accents)**: `#14B8A6`

---

## 📂 Academic Design Documents & PDFs
All the official project design artifacts, schemas, and diagrams are included directly in the root of the repository:
- 📋 [FSD Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/FSD_Documentation.pdf) - Full Stack Development (FSD) technical reference report, complete with system architecture, ER diagrams, UML class diagrams, and API routing references.
- 📋 [MedConnect FSD Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/MedConnect_FSD_Documentation.pdf) - Project planning and additional structural documents.

---

## 🛠️ Repository Layout
The repository is structured as a decoupled monorepo:
- [frontend/](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/frontend): React.js frontend client SPA built with Vite.
- [backend/](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/backend): Node.js/Express.js backend REST API.

---

## 🚀 How to Run Locally

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

---

## ⚙️ How to Deploy the Backend to Render

To get your backend live on Render like the ShopEZ reference project:
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository `kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR`.
4. Configure the Web Service settings:
   - **Name**: `vip-c2-book-a-doctor` (or custom name)
   - **Root Directory**: `backend`
   - **Environment/Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
   - `JWT_SECRET`: A secure key for token signing (e.g. `your_secret_key`)
   - `JWT_REFRESH_SECRET`: A secure key for token rotation (e.g. `your_refresh_secret`)
6. Click **Deploy Web Service**. Render will build and deploy your backend and provide a live URL (e.g., `https://vip-c2-book-a-doctor.onrender.com`).
7. Update the `VITE_API_URL` environment variable on your Vercel deployment project settings to point to this backend URL so your frontend app communicates with the live database!
