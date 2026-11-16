import React from 'react';

const ImageModal = ({ isOpen, imageUrl, alt = 'Inspection Image', onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-surface-container-lowest dark:bg-surface rounded-xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <img src={imageUrl} alt={alt} className="w-full h-full object-contain max-h-[85vh]" />
        <div className="px-4 py-2.5 bg-surface-container-low dark:bg-surface-container flex items-center justify-between text-xs text-on-surface-variant">
          <span>{alt}</span>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open Original</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
