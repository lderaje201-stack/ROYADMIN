import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900 text-white border-slate-700';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-950 text-emerald-100 border-emerald-800/60';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-950 text-amber-100 border-amber-800/60';
            icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-950 text-rose-100 border-rose-800/60';
            icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          } else if (toast.type === 'info') {
            bgColor = 'bg-blue-950 text-blue-100 border-blue-800/60';
            icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                id={`dismiss-toast-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="p-1 hover:opacity-75 rounded-md transition-opacity"
              >
                <X className="w-4 h-4 opacity-70" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
