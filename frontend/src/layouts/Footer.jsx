import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 text-left">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl tracking-wide">
              <svg className="w-6 h-6 fill-brand-500" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
              <span>MedConnect</span>
            </Link>
            <p className="mt-4 text-sm max-w-md leading-relaxed">
              MedConnect is a trusted full-stack healthcare and telemedicine platform facilitating seamless consultations, appointment booking, secure clinical report sharing, and patient reviews.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/doctors" className="hover:text-brand-500">Find Specialised Doctors</Link></li>
              <li><Link to="/#faq" className="hover:text-brand-500">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="block">Email: support@medconnect.local</span></li>
              <li><span className="block">Phone: +1 800-MED-CONN</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} MedConnect Care. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>HIPAA Compliant</span>
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
