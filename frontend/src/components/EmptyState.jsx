import React from 'react';
import { ArchiveRestore } from 'lucide-react';

const EmptyState = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-darkBg-card/30 border border-dashed border-slate-200 dark:border-darkBg-border/70 max-w-lg mx-auto">
      <div className="p-4 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-500 mb-4 animate-float">
        <ArchiveRestore className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
};

export default EmptyState;
