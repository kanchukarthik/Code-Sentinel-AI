import React from 'react';
import { FaultLocalizationItem } from '../../types/bugDetection';
import { Flame, AlertTriangle, Target } from 'lucide-react';

interface FaultLocalizationHeatmapProps {
  items: FaultLocalizationItem[];
  methodName?: string;
  targetFile: string;
}

export const FaultLocalizationHeatmap: React.FC<FaultLocalizationHeatmapProps> = ({
  items,
  methodName = 'SBFL Ochiai Metric',
  targetFile,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080c14] overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Fault Localization Suspect Spectrum: {targetFile}
          </span>
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300">
          {methodName}
        </span>
      </div>

      {/* Ochiai formula banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 px-4 py-1.5 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>Formula: S_Ochiai(s) = n_cf / √(n_f × (n_cf + n_cs))</span>
        <span className="text-amber-400 font-semibold">Higher score = Greater probability of fault</span>
      </div>

      {/* Suspect lines list */}
      <div className="divide-y divide-slate-800/40">
        {items.map((item) => {
          const pct = Math.round(item.score * 100);
          const isTopSuspect = item.rank === 1;

          return (
            <div
              key={item.line}
              className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                isTopSuspect
                  ? 'bg-rose-950/30 text-rose-200 border-l-4 border-rose-500'
                  : item.isSuspect
                  ? 'bg-amber-950/20 text-amber-200 border-l-4 border-amber-500'
                  : 'text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              {/* Rank Badge */}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                  isTopSuspect
                    ? 'bg-rose-500 text-black'
                    : item.isSuspect
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                #{item.rank}
              </span>

              {/* Line Number */}
              <span className="w-12 text-slate-500 text-[11px]">
                L:{item.line}
              </span>

              {/* Code snippet */}
              <div className="flex-1 overflow-x-auto whitespace-pre font-mono text-[11px]">
                <code>{item.code}</code>
              </div>

              {/* Ochiai Score Meter */}
              <div className="flex items-center gap-2 w-36 flex-shrink-0">
                <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isTopSuspect
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : item.isSuspect
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] font-bold">
                  {item.score.toFixed(3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
