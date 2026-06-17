# Phase 2: Requirement Analysis — MediConnect Pro™

## 1. Software Requirements Specification (SRS)

### A. Functional Requirements
1. **Multi-Role User Portals**:
   - **Patients**: Browse doctors, select availability slots, upload medical records, review consulting doctors, and download PDF prescriptions.
   - **Doctors**: Manage consultation requests, set up schedules, review patient uploads, compose prescriptions, and inspect aggregated earnings.
   - **Admins**: Manage practitioner verification queues, moderate doctor profiles, and review reviews.
   - **Super Admins**: Inspect platform-wide Chart.js analytics telemetry, view action audit logs, and toggle global configurations.
2. **Search Directory**:
   - Real-time text search for names, hospitals, or keywords.
   - Filtering options for specializations, experience levels, consulting fees, and ratings.
3. **Anti-Collision Scheduling**:
   - Unique slot generation. Blocking booked slots to prevent double-booking.
4. **Medical Locker**:
   - Private document repository (Multipart upload support for PDF/images).
5. **Real-time Notifications**:
   - Instant push notifications on status updates using WebSockets.

### B. Non-Functional Requirements
1. **Data Security**: JWT session cookies with automated rotation to prevent token hijacking.
2. **Access Control**: Row-level verification to secure patient documents.
3. **Reactivity**: Under 100ms render response on state modification using Redux Toolkit.
4. **Scalability**: Decoupled MVC backend server structure to scale compute independently from DB instances.

---

## 2. Data Flow Diagrams (DFD)

### Level 0: Context Diagram
```text
                  +-----------------------------------+
                  |                                   |
  Patient ------> |                                   | <------ Doctor
  (Bookings,      |        MEDICONNECT PLATFORM       | (Schedules,
   Records)       |                                   |  Prescriptions)
                  |                                   |
                  +-----------------+-----------------+
                                    |
                                    v
                                  Admin
                         (Approvals, Analytics)
```

### Level 1: Key Functional Data Flows
1. **User Authentication Flow**:
   User Credentials Input -> Auth Middleware -> Password Hashing Check (Bcrypt) -> JWT Response Cookie + Redux State Update.
2. **Booking Slot Flow**:
   Availability Query -> AvailabilitySlot Model (Validate `isBooked: false`) -> Transaction Ledger -> Appointment Created -> Socket.io Broadcast to Doctor Dashboard.
3. **Locker Upload Flow**:
   Patient File Input -> Multer Middleware -> Cloudinary CDN / Temp Local Storage -> MedicalRecord Document Instance -> Doctor Consultation History Verification -> Document Revealed.

---

## 3. Technology Stack Justification

| Technology | Purpose | Justification |
| :--- | :--- | :--- |
| **MongoDB** | Database | Flexible BSON document model suited for dynamic schemas (medical records lists, prescription lists, availability hashes). |
| **Express.js** | Server Framework | Node.js routing and middleware framework, providing low-overhead REST path mappings and CORS controllers. |
| **React (Vite)** | Frontend SPA | High-speed build pipelines, hot-reloading dev servers, and declarative component state renders. |
| **Node.js** | Runtime | Event-driven non-blocking I/O model, enabling heavy concurrent operations (e.g. Socket.io pipelines, Puppeteer PDF exports). |
| **Redux Toolkit** | State Store | Centralized, predictable data updates across decoupled patient/doctor dashboards. |
| **Socket.io** | WebSockets | Persistent bi-directional TCP handshakes for push notification alerts. |
| **Puppeteer** | PDF Export | Dynamic HTML-to-PDF compilation rendering layout styling sheets. |
