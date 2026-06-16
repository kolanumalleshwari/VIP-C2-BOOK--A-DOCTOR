import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const skeletons = Array(count).fill(0);

  if (type === 'table') {
    return (
      <div className="w-full space-y-4">
        <div className="h-10 w-full skeleton-shimmer rounded-lg" />
        {skeletons.map((_, i) => (
          <div key={i} className="h-16 w-full skeleton-shimmer rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletons.map((_, i) => (
        <div key={i} className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 skeleton-shimmer rounded" />
              <div className="h-3 w-1/2 skeleton-shimmer rounded" />
            </div>
          </div>
          <div className="h-3 w-full skeleton-shimmer rounded" />
          <div className="h-3 w-5/6 skeleton-shimmer rounded" />
          <div className="pt-4 flex justify-between items-center">
            <div className="h-4 w-1/4 skeleton-shimmer rounded" />
            <div className="h-8 w-1/3 skeleton-shimmer rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
