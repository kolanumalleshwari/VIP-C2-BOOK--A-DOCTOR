import React from 'react';
import {
  Calendar,
  FileText,
  Bell,
  Star,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ currentTab, setCurrentTab, role }) => {
  // Define tabs configuration per role
  const patientTabs = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: Settings },
  ];

  const doctorTabs = [
    { id: 'requests', label: 'Appointment Requests', icon: Calendar },
    { id: 'schedule', label: 'Manage Schedule', icon: ClipboardList },
    { id: 'reports', label: 'Patient Reports', icon: FileText },
    { id: 'analytics', label: 'Earnings & Reviews', icon: BarChart3 },
    { id: 'profile', label: 'Doctor Profile', icon: Settings },
  ];

  const adminTabs = [
    { id: 'approvals', label: 'Doctor Verification', icon: ShieldCheck },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reports', label: 'System Reports Log', icon: FileText },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Admin Settings', icon: Settings },
  ];

  const tabs = role === 'Admin' ? adminTabs : role === 'Doctor' ? doctorTabs : patientTabs;

  return (
    <div className="w-full md:w-64 flex flex-col bg-white dark:bg-darkBg-card border-r border-slate-100 dark:border-darkBg-border py-6 h-auto md:h-[calc(100vh-4rem)]">
      <div className="px-6 mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard Menu</span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-brand-600 dark:text-brand-500' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
