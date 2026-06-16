# MedConnect – Full-Stack Doctor Appointment Booking Platform

MedConnect is a premium healthcare management platform featuring search tools, scheduling systems, and patient/doctor/admin portal control panels.

---

## Live Deployments

- **Live Storefront (Web App)**: [https://medconnect-patient-doctor.vercel.app](https://medconnect-patient-doctor.vercel.app)
- **Backend API Server**: [https://medconnect-api.onrender.com](https://medconnect-api.onrender.com)

---

## Technical Architecture

- **Backend**: Node.js & Express.js, Mongoose/MongoDB, JWT authentication, Socket.io real-time push events.
- **Frontend**: React.js & Vite, Tailwind CSS, Chart.js, Framer Motion.
- **Files Storage**: Cloudinary (with automatic fallback to local server uploads).
- **Mailing**: Nodemailer (with automatic fallback to server stdout terminal logs).

---

## 1. Local Workspace Installation Guide

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB instance running locally (default: `mongodb://localhost:27017/medconnect`) or a MongoDB Atlas connection URI string.

### Setup Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in your `.env` file (see the [Environment Variables](#2-environment-variables-setup) section below).
4. Launch the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server starts on port `5000`.*

### Setup Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Run the Vite React application locally:
   ```bash
   npm run dev
   ```
   *The client runs on port `3000` (auto-proxies all API requests to the backend on port `5000`).*

---

## 2. Environment Variables Setup

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medconnect
JWT_SECRET=medconnect_jwt_super_secret_key_123456

# Optional: Cloudinary Configuration. If empty, files are saved inside backend/uploads/
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# Optional: SMTP email configuration. If empty, emails are logged directly to the server terminal/console.
EMAIL_USER=
EMAIL_PASS=
```

---

## 3. MongoDB Configuration

### Local Database
By default, the application connects to a local MongoDB instance. Install and run community edition server locally:
- **Windows**: Use the MSI installer or start via PowerShell service:
  ```powershell
  Start-Service MongoDB
  ```
- **URI Configuration**: Set `MONGO_URI=mongodb://localhost:27017/medconnect`

### Cloud Database (MongoDB Atlas)
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Shared Free Cluster.
3. Add a database user with password credentials, and whitelist access IP address `0.0.0.0/0`.
4. Retrieve connection string and replace the local URI:
  ```env
  MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medconnect?retryWrites=true&w=majority
  ```

---

## 4. Deployment Guide

### Deploying the Backend (Node/Express)
1. Set environment variables to production settings:
   ```env
   NODE_ENV=production
   ```
2. Package server for PaaS platforms (Render, Heroku, or railway):
   - Configure Start command: `npm start`
   - Bind environment properties inside the platform dashboard settings.
   - Serve static static folder uploads or use external storage providers (Cloudinary is recommended for production deployment).

### Deploying the Frontend (React/Vite)
1. Build compilation files for production:
   ```bash
   npm run build
   ```
2. Deploy the resulting `/dist` folder to static web hosts (Vercel, Netlify, or Hostinger).
3. Set proxy/CORS variables matching the production backend server domain name.
