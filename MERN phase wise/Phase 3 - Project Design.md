# Phase 3: Project Design — MediConnect Pro™

## 1. Problem-Solution Fit Matrix

| Identified Pain Point | Technical Design Solution | Implementation Detail |
| :--- | :--- | :--- |
| **Appointment Overlaps** | Compound Unique DB Constraints | Created a Mongoose compound index on `AppointmentSchema` restricting `doctorId`, `appointmentDate`, and `appointmentTime` to prevent concurrent slot conflicts. |
| **Medical Report Leaks** | History Check Access Middleware | Added validation middleware in `/api/records` verifying if the requesting doctor has a completed appointment with the patient before returning file storage locations. |
| **Prescription Compilation Lag** | Puppeteer Headless Isolation | Rendered print-friendly HTML and compiled it directly via isolated `puppeteer-core` runtime, reducing blocking CPU cycles. |
| **Stale Session Expiration** | Silent Token Rotation (RTR) | Implemented Axios interceptors refreshing expiring tokens using rotating HTTP-only cookies without requiring manual user relogin. |

---

## 2. Decoupled MERN System Architecture

```text
  +-------------------------------------------------------------+
  |                        React SPA Client                     |
  |   (Redux State, Context Providers, Tailwind Layout Modules) |
  +------------------------------+------------------------------+
                                 |
                        (HTTP API Requests)
                                 v
  +------------------------------+------------------------------+
  |                   Express Web Server (NodeJS)               |
  |   (REST Endpoints Controllers, Token Handshakes Middleware) |
  +-------------------+--------------------+--------------------+
                      |                    |
             (Mongoose Queries)     (WebSocket Alerts)
                      v                    v
  +-------------------+----+      +--------+--------------------+
  |      MongoDB Cluster   |      |     Socket.io Engine        |
  | (Validated Document ODMs)|      | (Bi-directional TCP Links) |
  +------------------------+      +-----------------------------+
```

---

## 3. Database Schema Reference (Data Models)

### A. User Schema (`User.js`)
- `name`: String (Required)
- `email`: String (Required, Unique)
- `password`: String (Required)
- `role`: String (Enum: `Patient`, `Doctor`, `Admin`, `Super Admin`)
- `phone`: String
- `gender`: String
- `profileImage`: String (Cloudinary URL)

### B. Doctor Schema (`Doctor.js`)
- `userId`: ObjectId (Ref: `User`, Required)
- `specialization`: String (Required)
- `qualification`: String (Required)
- `experience`: Number (Required)
- `consultationFee`: Number (Required)
- `hospitalName`: String
- `clinicAddress`: String
- `bio`: String
- `approved`: Boolean (Default: `false`)
- `rating`: Number (Default: `4.0`)
- `totalReviews`: Number (Default: `0`)

### C. Appointment Schema (`Appointment.js`)
- `patientId`: ObjectId (Ref: `Patient`, Required)
- `doctorId`: ObjectId (Ref: `Doctor`, Required)
- `appointmentDate`: Date (Required)
- `appointmentTime`: String (Required)
- `reason`: String
- `status`: String (Enum: `Pending`, `Confirmed`, `Completed`, `Cancelled`, Default: `Pending`)
- `telemedicineUrl`: String
- `paymentRef`: ObjectId (Ref: `Payment`)

### D. MedicalRecord Schema (`MedicalRecord.js`)
- `patientId`: ObjectId (Ref: `Patient`, Required)
- `recordTitle`: String (Required)
- `recordType`: String (Enum: `Lab Report`, `Prescription`, `Scan`, `Other`)
- `description`: String
- `recordFile`: String (Required, Upload path / URL)
