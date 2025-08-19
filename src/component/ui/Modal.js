import React, { useEffect } from 'react';
import Button from './Button';

const sizeToClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

const Modal = ({ 
  isOpen, 
  title, 
  children, 
  onClose, 
  footer, 
  size = 'lg', 
  className = '',
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" 
        onClick={closeOnBackdrop ? onClose : undefined} 
      />
      <div className={`relative w-full ${sizeToClass[size] || sizeToClass.lg} max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-in ${className}`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            }
            {showCloseButton && (
              <button 
                onClick={onClose} 
                aria-label="Close" 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;