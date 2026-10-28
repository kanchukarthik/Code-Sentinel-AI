import React from 'react';
import { PatchValidationReport } from '../../types/patchReview';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Dna,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ValidationReportViewProps {
  validation: PatchValidationReport;
}

export const ValidationReportView: React.FC<ValidationReportViewProps> = ({ validation }) => {
  const isVerified = validation.verdict === 'verified';
  const isRegressed = validation.verdict === 'regressed';

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070b14] p-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h4 className="font-semibold text-slate-200">
            Validation Agent Verification Report
          </h4>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
            isVerified
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
              : isRegressed
              ? 'border-rose-500/30 bg-rose-950/40 text-rose-300'
              : 'border-amber-500/30 bg-amber-950/40 text-amber-300'
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>{validation.verdict}</span>
        </span>
      </div>

      {/* 4 Scorecards */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Baseline Tests */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">
            Baseline Suite
          </span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {validation.baselineTestsPassed}/{validation.baselineTestsTotal} Pass
            </span>
          </div>
        </div>

        {/* Synthesized Tests */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">
            Synthesized Suite
          </span>
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
            <Zap className="h-4 w-4" />
            <span>
              {validation.synthesizedTestsPassed}/{validation.synthesizedTestsTotal} Pass
            </span>
          </div>
        </div>

        {/* Regressions */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">
            Regressions
          </span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
            <span>{validation.regressionsIntroduced} detected</span>
          </div>
        </div>

        {/* False-Positive Risk */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">
            False-Positive Risk
          </span>
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-sm">
            <span>{(validation.falsePositiveRiskScore * 100).toFixed(0)}%</span>
            <span className="text-[10px] text-emerald-400 uppercase font-sans">
              ({validation.falsePositiveLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Verifier Notes */}
      <div className="mt-3 rounded-lg bg-slate-950/90 border border-slate-800/80 p-3 font-sans text-slate-300 text-xs">
        <span className="font-semibold text-slate-400 font-mono text-[11px] block mb-0.5">
          Autonomous Validation Verdict:
        </span>
        {validation.verifierNotes}
      </div>
    </div>
  );
};
