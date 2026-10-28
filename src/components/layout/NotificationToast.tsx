import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = usePipeline();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const icon =
          n.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : n.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          ) : n.type === 'error' ? (
            <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          );

        const borderClass =
          n.type === 'success'
            ? 'border-emerald-500/40 bg-slate-900/95'
            : n.type === 'warning'
            ? 'border-amber-500/40 bg-slate-900/95'
            : n.type === 'error'
            ? 'border-rose-500/40 bg-slate-900/95'
            : 'border-cyan-500/40 bg-slate-900/95';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5">{icon}</span>
              <div>
                <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                <p className="mt-0.5 text-[11px] text-slate-300 leading-snug">
                  {n.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="rounded p-0.5 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
