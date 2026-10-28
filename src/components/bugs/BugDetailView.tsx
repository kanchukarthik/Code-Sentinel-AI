import React from 'react';
import { Link } from 'react-router-dom';
import { DetectedBug } from '../../types/bugDetection';
import { StatusBadge } from '../common/StatusBadge';
import { FaultLocalizationHeatmap } from './FaultLocalizationHeatmap';
import {
  ShieldAlert,
  FileCode,
  Sparkles,
  Terminal,
  ArrowRight,
  Flame,
  CheckCircle2,
  Bug,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';

interface BugDetailViewProps {
  bug: DetectedBug | null;
}

export const BugDetailView: React.FC<BugDetailViewProps> = ({ bug }) => {
  if (!bug) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-slate-500">
        <Bug className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm font-medium">Select a detected defect to inspect root cause & fault localization</p>
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-bold text-rose-300 border border-rose-500/30">
              {bug.bugKey}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getSeverityBadge(
                bug.severity
              )}`}
            >
              {bug.severity}
            </span>
            <StatusBadge status={bug.status} size="sm" />
          </div>

          <h3 className="mt-2 text-base font-bold text-white leading-tight">
            {bug.title}
          </h3>
        </div>

        {/* Action Link to Patches */}
        <Link
          to="/patches"
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-all self-start sm:self-auto"
        >
          <span>Review Candidate Patch</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Target File & Detection Confidence */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Target Location</span>
          <div className="flex items-center gap-1.5 text-slate-200">
            <FileCode className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
            <span className="truncate">{bug.targetFile}:{bug.targetLine}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Detection Confidence</span>
          <span className="text-cyan-400 font-bold text-sm">
            {bug.detectionConfidence.toFixed(1)}%
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Triggered by Synthetic Test</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <FlaskConical className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{bug.associatedTestName}</span>
          </div>
        </div>
      </div>

      {/* Cognitive Root-Cause Analysis Explanation */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          Root-Cause Agent Cognitive Diagnosis
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
          {bug.rootCauseExplanation}
        </p>
      </div>

      {/* Fault Localization Suspect Spectrum */}
      <FaultLocalizationHeatmap
        items={bug.faultLocalizationRanking}
        targetFile={bug.targetFile}
        methodName={bug.faultLocalizationMethod}
      />

      {/* Stack Trace / Log Excerpt */}
      <div className="rounded-xl border border-slate-800 bg-[#060a12] overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-rose-400" />
            V8 Sandbox Execution Failure Stack Trace
          </span>
        </div>
        <pre className="p-4 text-[11px] text-rose-300 overflow-x-auto leading-relaxed bg-[#050810]">
          <code>{bug.stackTrace}</code>
        </pre>
      </div>
    </div>
  );
};
