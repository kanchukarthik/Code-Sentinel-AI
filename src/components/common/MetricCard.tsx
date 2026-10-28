import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: number;
    isPositiveGood?: boolean;
    period?: string;
  };
  description?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  delta,
  description,
  icon,
  highlight = false,
  className = '',
}) => {
  const isPositive = delta ? delta.value > 0 : false;
  const isZero = delta ? delta.value === 0 : true;
  const isGood = delta ? (delta.isPositiveGood !== false ? isPositive : !isPositive) : true;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
        highlight
          ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-900 to-slate-900/90 shadow-lg shadow-cyan-950/20'
          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700/80'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 text-slate-400">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && <span className="text-slate-400/80">{icon}</span>}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {delta !== undefined && (
          <div
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium font-mono ${
              isZero
                ? 'bg-slate-800 text-slate-400'
                : isGood
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isZero ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>
              {delta.value > 0 ? `+${delta.value}` : delta.value}%
            </span>
            {delta.period && (
              <span className="ml-1 text-[10px] text-slate-400 font-sans">
                {delta.period}
              </span>
            )}
          </div>
        )}

        {description && (
          <span className="truncate text-slate-400 text-[11px]" title={description}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
