import React from 'react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  children,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-xl shadow-2xl border border-outline-variant/40 dark:border-outline/30 p-6 flex flex-col gap-4">
        {/* Title & Icon */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-error-container text-error'
                : 'bg-primary-container/20 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDestructive ? 'warning' : 'info'}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            {message && <p className="text-xs text-on-surface-variant mt-1">{message}</p>}
          </div>
        </div>

        {/* Custom Body / Form content */}
        {children && <div className="mt-1">{children}</div>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-outline-variant/20 dark:border-outline/20">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
              isDestructive
                ? 'bg-error hover:bg-error/90 active:scale-95'
                : 'bg-primary hover:bg-primary-container active:scale-95'
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
