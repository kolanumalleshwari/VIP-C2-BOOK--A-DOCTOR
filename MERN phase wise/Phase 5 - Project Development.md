# Phase 5: Project Development — MediConnect Pro™

## 1. User Acceptance Testing (UAT) Test Cases

### UAT-01: Multi-Role Secure Authentication
- **Test Objective**: Verify registration, login, JWT issuance, and page routing guards based on roles.
- **Test Action**:
  1. Register a new user with email `testpatient@domain.com` and select 'Patient'.
  2. Log in using the registration credentials.
- **Expected Outcome**:
  - JWT token saved to localStorage.
  - Page routes to `/patient-dashboard`.
  - Side navigation renders patient tabs.
- **Status**: **PASSED**

### UAT-02: Search & Filter Specialist Directory
- **Test Objective**: Verify filter operations for specialties, hospital locations, and fees.
- **Test Action**:
  1. Open `/doctors` directory.
  2. Type "Cardiology" in the specialty filter.
- **Expected Outcome**:
  - Loader placeholder triggers.
  - Returns only doctors with Cardiology specialty.
- **Status**: **PASSED**

### UAT-03: Collision-Free Scheduling Calendar
- **Test Objective**: Validate slot locking and duplicate booking collision checks.
- **Test Action**:
  1. Book Dr. John Harrison for June 20th at 10:00 AM.
  2. Re-open slot picker for Dr. Harrison on the same date.
- **Expected Outcome**:
  - First booking completes, status set to Pending.
  - 10:00 AM slot is hidden/disabled on subsequent attempts.
  - Submitting duplicate values via API returns validation error.
- **Status**: **PASSED**

### UAT-04: Secure Medical locker Shield
- **Test Objective**: Verify document upload and row-level access controls.
- **Test Action**:
  1. Upload PDF report `bloodtest.pdf` as Patient.
  2. Attempt to view file link from a Doctor account with no consultation history with the patient.
- **Expected Outcome**:
  - Patient locker lists file successfully.
  - Unauthorized Doctor access returns `403 Access Denied`.
- **Status**: **PASSED**

### UAT-05: PDF Prescription Compiler
- **Test Objective**: Verify digital prescription creation and PDF document compilation.
- **Test Action**:
  1. Log in as Doctor, select Completed appointment.
  2. Type advice and medicines, click 'Submit Prescription'.
- **Expected Outcome**:
  - Puppeteer compiles HTML prescription to PDF.
  - PDF file saved to backend server and URL stored in database.
  - Patient downloads PDF successfully.
- **Status**: **PASSED**

---

## 2. Test Execution Log Summary

| Test ID | Area | Input Data | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT-01** | Auth | `superadmin@mediconnect.com` | Redirect to `/super-admin-dashboard` | Redirected successfully | **PASS** |
| **UAT-02** | Search | "Neurology" | List 8 Neurologists | 8 Neurologists listed | **PASS** |
| **UAT-03** | Schedule | Collision test | Block write database error | Blocked with 400 validation error | **PASS** |
| **UAT-04** | Locker | File upload | File url saved in DB | File saved successfully | **PASS** |
| **UAT-05** | Prescribe| Medicine list inputs | Compile print-friendly PDF | PDF compiled & downloaded | **PASS** |
| **UAT-06** | Telemetry| System audit logs query | List action timestamps | Action timestamps listed | **PASS** |
