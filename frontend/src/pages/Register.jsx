import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [role, setRole] = useState('Patient'); // Patient or Doctor
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role, phone, gender);
      if (role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h2>
          <p className="text-slate-400 text-xs">Join MedConnect to schedule clinical care</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 text-red-600 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Role selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('Patient')}
                className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                  role === 'Patient'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-darkBg-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Patient Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('Doctor')}
                className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                  role === 'Doctor'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-darkBg-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Doctor Practitioner
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. John Doe / John Doe"
                className="w-full bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-darkBg-border">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
