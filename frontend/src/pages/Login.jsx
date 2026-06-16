import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Redirect based on role
      if (data.user.role === 'Super Admin') {
        navigate('/super-admin-dashboard');
      } else if (data.user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (data.user.role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-darkBg relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs">Access your MedConnect portal dashboard</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 text-red-600 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Fast Credentials Autofill</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => { setEmail('superadmin@mediconnect.com'); setPassword('Admin@123'); }}
              className="py-1.5 px-2 bg-indigo-50 dark:bg-indigo-950/20 text-[#4338CA] rounded-lg border border-[#4338CA]/20 text-center font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@mediconnect.com'); setPassword('Admin@123'); }}
              className="py-1.5 px-2 bg-blue-50 dark:bg-blue-950/20 text-[#2563EB] rounded-lg border border-blue-500/20 text-center font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('doctor1@mediconnect.com'); setPassword('Admin@123'); }}
              className="py-1.5 px-2 bg-teal-50 dark:bg-teal-950/20 text-[#14B8A6] rounded-lg border border-[#14B8A6]/20 text-center font-semibold hover:bg-teal-100 dark:hover:bg-teal-950/40 transition"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => { setEmail('patient1@mediconnect.com'); setPassword('Admin@123'); }}
              className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/20 text-[#10B981] rounded-lg border border-emerald-500/20 text-center font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition"
            >
              Patient
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-darkBg-border">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
