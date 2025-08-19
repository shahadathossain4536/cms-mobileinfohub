import React, { useEffect } from 'react';
import Button from './Button';

const sizeToClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
  full: 'max-w-[90vw]'
};

const Modal = ({ isOpen, title, children, onClose, footer, size = 'lg', className = '' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${sizeToClass[size] || sizeToClass.lg} rounded-xl bg-white dark:bg-slate-800 shadow-xl ${className}`}>
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur z-10 rounded-t-xl">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-b-xl">
          {footer || <Button variant="secondary" onClick={onClose}>Close</Button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;


