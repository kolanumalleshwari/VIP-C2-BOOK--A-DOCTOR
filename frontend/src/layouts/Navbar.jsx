import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, User as UserIcon, LayoutDashboard, Menu, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getNotifications, markNotificationsRead } from '../services/notificationService.js';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-brand-600 dark:text-brand-500 font-bold text-2xl font-sans tracking-wide">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
              <span>MediConnect Pro™</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/doctors" className={`text-sm font-medium ${location.pathname === '/doctors' ? 'text-brand-600 dark:text-brand-500' : 'text-slate-600 dark:text-slate-300 hover:text-brand-500'}`}>
              Find Doctors
            </Link>
            {user && (
              <Link
                to={user.role === 'Super Admin' ? '/super-admin-dashboard' : user.role === 'Admin' ? '/admin-dashboard' : user.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500"
              >
                Dashboard
              </Link>
            )}
            <Link to="/#faq" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500">
              FAQs
            </Link>

            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-darkBg"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-darkBg-card shadow-2xl border border-slate-100 dark:border-darkBg-border py-2 z-50">
                      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 dark:border-darkBg-border">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto px-2 py-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`p-3 rounded-lg my-1 text-left ${n.readStatus ? 'opacity-70 bg-transparent' : 'bg-slate-50 dark:bg-slate-800/40 border-l-4 border-brand-500'}`}>
                              <p className="font-bold text-xs text-slate-800 dark:text-white">{n.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-brand-500/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-darkBg-card shadow-2xl border border-slate-100 dark:border-darkBg-border py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-darkBg-border">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        to={user.role === 'Super Admin' ? '/super-admin-dashboard' : user.role === 'Admin' ? '/admin-dashboard' : user.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-500 px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/10">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={toggleDarkMode} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-darkBg-border py-2 bg-white dark:bg-darkBg shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-left">
            <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              Find Doctors
            </Link>
            {user && (
              <Link
                to={user.role === 'Super Admin' ? '/super-admin-dashboard' : user.role === 'Admin' ? '/admin-dashboard' : user.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-bold border border-slate-200 dark:border-slate-800 rounded-xl py-2 hover:bg-slate-50">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-bold bg-brand-500 text-white rounded-xl py-2 hover:bg-brand-600">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
