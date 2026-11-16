import React from 'react';

export const LoadingSpinner = ({ text = 'Loading records...' }) => (
  <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant animate-in fade-in">
    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <span className="text-xs font-medium">{text}</span>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="w-full animate-pulse p-4 space-y-3">
    {Array.from({ length: rows }).map((_, rIdx) => (
      <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-surface-container/60">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <div
            key={cIdx}
            className="h-4 bg-surface-container rounded"
            style={{ width: `${Math.floor(Math.random() * 40) + 60}px` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
