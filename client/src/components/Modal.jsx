import { useEffect } from 'react';

export const Modal = ({ isOpen, title, onClose, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
