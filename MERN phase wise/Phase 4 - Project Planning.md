# Phase 4: Project Planning — MediConnect Pro™

## 1. Product Backlog & Story Point Mapping

| Story ID | Role | Feature Request / User Story | Priority | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | User | "As a visitor, I want to register and sign in under Patient or Doctor roles so I can access dashboards." | Must | 5 |
| **US-02** | Patient | "As a patient, I want to browse/search the doctor directory and filter doctors by specialized fields." | Must | 3 |
| **US-03** | Patient | "As a patient, I want to book available slots and complete checkout to schedule a consultation." | Must | 8 |
| **US-04** | Doctor | "As a doctor, I want to manage my calendar, review slot requests, and update consultation outcomes." | Must | 5 |
| **US-05** | Doctor | "As a doctor, I want to write digital prescriptions and download them as PDFs." | Should | 5 |
| **US-06** | Patient | "As a patient, I want to upload lab records to a secure digital locker." | Should | 3 |
| **US-07** | Admin | "As an admin, I want to verify doctor onboarding details before they are visible in search results." | Must | 3 |
| **US-08** | S. Admin | "As a super admin, I want to review aggregated revenue and cancelation analytics via interactive charts." | Could | 5 |

---

## 2. Sprint Cycles Definition

- **Sprint 1: Database & Identity Setup (Weeks 1-2)**:
  - Database schema models deployment.
  - Multi-role JWT registration and token rotation interceptors implementation.
- **Sprint 2: Search Directory & Slot Selection (Weeks 3-4)**:
  - Doctor search filters and calendar slots selectors development.
  - Collision checks middleware implementation.
- **Sprint 3: Practice Management & Locker (Weeks 5-6)**:
  - Doctor workspace drawer, consultation pipelines, and patient records lockers.
  - HTML-to-PDF compiler and medical file sharing authorization implementation.
- **Sprint 4: Telemetry Analytics & Audit Checks (Weeks 7-8)**:
  - Socket.io alerts, Chart.js graphs, and super admin operations logs.
  - Production deployments on Vercel and Render.

---

## 3. Risk Register

| Identified Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Double Booking Conflicts** | High | Medium | Implemented unique compound database indices on `doctorId` + `date` + `time` variables in Mongoose to prevent concurrent transaction write collisions. |
| **Medical Record Data Leaks** | High | Low | Deployed custom auth validation middleware ensuring files can only be accessed by the patient owner or a doctor with a verified appointment history. |
| **Server Timeout during PDF Export** | Medium | Medium | Isolated the Puppeteer browser compilation using `puppeteer-core` with chromium arguments, wrapping the call in try/catch loops with temporary local path fallbacks. |
| **Database Connection Failures** | High | Low | Configured local MongoDB server fallback (`localhost:27017`) in database helper utilities when Atlas cloud servers are unreachable. |
