import React from 'react';

const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  onAction,
}) => (
  <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
      <span className="material-symbols-outlined text-[28px]">{icon}</span>
    </div>
    <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
    <p className="text-xs text-on-surface-variant max-w-sm mt-1">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
