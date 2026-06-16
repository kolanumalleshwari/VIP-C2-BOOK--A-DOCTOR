import React from 'react';
import { HelpCircle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

const AppointmentTimeline = ({ status }) => {
  const isCancelled = status === 'Cancelled';

  const stages = [
    { label: 'Requested', statusKey: 'Pending', icon: HelpCircle, color: 'text-yellow-500 bg-yellow-500/10' },
    { label: 'Confirmed', statusKey: 'Confirmed', icon: CheckCircle, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Completed', statusKey: 'Completed', icon: Sparkles, color: 'text-brand-500 bg-brand-500/10' },
  ];

  // Determine active stage index
  let activeIndex = 0;
  if (status === 'Confirmed') activeIndex = 1;
  if (status === 'Completed') activeIndex = 2;

  if (isCancelled) {
    return (
      <div className="flex items-center space-x-3 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 text-left">
        <div className="p-2 rounded-full bg-red-500 text-white animate-pulse">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-xs text-red-700 dark:text-red-400">Appointment Cancelled</p>
          <p className="text-[10px] text-red-500/80 mt-0.5">This appointment slot is inactive. You can schedule another slot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
        />

        {/* Stages */}
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={idx} className="flex flex-col items-center z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
                  isCurrent
                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20 scale-110'
                    : isPassed
                    ? 'bg-brand-100 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-900/50'
                    : 'bg-white dark:bg-darkBg-card text-slate-400 border-slate-200 dark:border-darkBg-border'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-brand-600 dark:text-brand-500' : 'text-slate-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentTimeline;
