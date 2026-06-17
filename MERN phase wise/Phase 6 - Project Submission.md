# Phase 6: Project Submission — MediConnect Pro™

## 1. Deployed Live Application URLs
- 🌐 **Web Application (Vercel Frontend Client)**: [https://frontend-olive-chi-70.vercel.app/](https://frontend-olive-chi-70.vercel.app/)
- ⚙️ **Backend REST API (Render Node Server)**: [https://vip-c2-book-a-doctor.onrender.com](https://vip-c2-book-a-doctor.onrender.com)

---

## 2. Evaluation Testing Credentials (Autofill Accounts)

You can click any role autofill tab on the Login page to populate these accounts:

### A. Super Admin (Operations Telemetry & Audit Logs)
- **Email**: `superadmin@mediconnect.com`
- **Password**: `Admin@123`
- **Dashboard Features**: Chart.js analytics graphs (earnings, cancellations), system-wide operations audit logs, global settings toggles.

### B. Admin (Practitioner Listings & Onboarding moderation)
- **Email**: `admin@mediconnect.com`
- **Password**: `Admin@123`
- **Dashboard Features**: Doctor verification approvals queue, feedback reviews list, specialty categories configuration.

### C. Doctor Workspace (Availabilities Calendar & Prescriptions Drawer)
- **Email**: `doctor1@mediconnect.com`
- **Password**: `Admin@123`
- **Dashboard Features**: FullCalendar schedule grid, patient medical records locker query, digital prescription creator, consultation fee records.

### D. Patient Portal (Slots Booking & Medical Locker uploads)
- **Email**: `patient1@mediconnect.com`
- **Password**: `Admin@123`
- **Dashboard Features**: Doctor search directory, simulated payment checkouts, PDF record uploads locker, PDF prescription downloads.

---

## 3. Academic Phase Documentation PDFs
The compiled design reports and system documentation are committed to the root of the repository:
- 📋 [FSD System Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/FSD_Documentation.pdf)
- 📋 [MedConnect FSD Documentation PDF](https://github.com/kolanumalleshwari/VIP-C2-BOOK--A-DOCTOR/blob/main/MedConnect_FSD_Documentation.pdf)

---

## 4. Local Execution Reference

### A. Database Seeding & Setup
```bash
cd backend
npm install
npm run seed   # Populates doctors list, patient locker details, and 6 months of ledger records.
```

### B. Start Application Concurrently
```bash
# Start backend API (Port 5000)
cd backend
npm run start

# Start frontend Vite server (Port 3000)
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.
