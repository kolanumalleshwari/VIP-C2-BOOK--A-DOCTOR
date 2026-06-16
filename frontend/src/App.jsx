import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Layouts
import Navbar from './layouts/Navbar.jsx';
import Footer from './layouts/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DoctorDiscovery from './pages/DoctorDiscovery.jsx';
import DoctorDetails from './pages/DoctorDetails.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Guard: Route Protected by Authentication & Roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <span className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!user) {
    // Save previous path and redirect to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-200">
              {/* Header Navbar */}
              <Navbar />

              {/* Page Contents */}
              <main className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/doctors" element={<DoctorDiscovery />} />
                  <Route path="/doctors/:id" element={<DoctorDetails />} />

                  {/* Patient Portal */}
                  <Route
                    path="/patient-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['Patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Portal */}
                  <Route
                    path="/doctor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['Doctor']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer Layout */}
              <Footer />

              {/* Toast Alerts container */}
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </div>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
