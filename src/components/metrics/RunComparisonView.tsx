import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  GitCommit,
  GitBranch,
  Clock,
  Dna,
  ShieldCheck,
  Bug,
  Sparkles,
} from 'lucide-react';

export const RunComparisonView: React.FC = () => {
  const { historicalRuns, activeRun } = usePipeline();

  const allRuns = [activeRun, ...historicalRuns.filter((r) => r.id !== activeRun.id)];

  const [runAId, setRunAId] = useState<string>(allRuns[0]?.id || '');
  const [runBId, setRunBId] = useState<string>(allRuns[1]?.id || allRuns[0]?.id || '');

  const runA = allRuns.find((r) => r.id === runAId) || allRuns[0];
  const runB = allRuns.find((r) => r.id === runBId) || allRuns[1] || allRuns[0];

  // Calculate deltas: Run A (newer) vs Run B (baseline)
  const covDiff = runA.summary.coveragePct - runB.summary.coveragePct;
  const mutDiff = runA.summary.mutationScore - runB.summary.mutationScore;
  const bugDiff = runA.summary.bugsDetected - runB.summary.bugsDetected;
  const durDiff = runA.durationSeconds - runB.durationSeconds;
  const testDiff = runA.summary.testsGenerated - runB.summary.testsGenerated;

  const renderDeltaPill = (val: number, isHigherGood: boolean = true, unit: string = '%') => {
    const isZero = Math.abs(val) < 0.01;
    const isPositive = val > 0;
    const isGood = isHigherGood ? isPositive : !isPositive;

    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
          isZero
            ? 'bg-slate-800 text-slate-400'
            : isGood
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        }`}
      >
        {isZero ? (
          <Minus className="h-3 w-3" />
        ) : isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        <span>
          {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
          {unit}
        </span>
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl font-mono text-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 font-sans">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-cyan-400" />
          <h4 className="font-bold text-slate-100 text-sm">
            Side-by-Side Pipeline Run Comparator
          </h4>
        </div>
        <span className="text-xs text-slate-400">
          Compare test coverage, mutation survival, and execution efficiency deltas
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Run A (Target) */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold uppercase text-[10px]">
              Run A (Target Run)
            </span>
            <StatusBadge status={runA.status} size="sm" />
          </div>
          <select
            value={runAId}
            onChange={(e) => setRunAId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {allRuns.map((r) => (
              <option key={r.id} value={r.id}>
                Run #{r.runNumber} &bull; {r.branch} ({r.commitHash.substring(0, 7)}) &bull; {r.summary.coveragePct}% cov
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 font-sans truncate">
            {runA.commitMessage}
          </div>
        </div>

        {/* Run B (Baseline) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold uppercase text-[10px]">
              Run B (Baseline Comparison)
            </span>
            <StatusBadge status={runB.status} size="sm" />
          </div>
          <select
            value={runBId}
            onChange={(e) => setRunBId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {allRuns.map((r) => (
              <option key={r.id} value={r.id}>
                Run #{r.runNumber} &bull; {r.branch} ({r.commitHash.substring(0, 7)}) &bull; {r.summary.coveragePct}% cov
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 font-sans truncate">
            {runB.commitMessage}
          </div>
        </div>
      </div>

      {/* Side-by-side Metric Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left">
          <thead className="border-b border-slate-800 bg-slate-900/60 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Evaluation Dimension</th>
              <th className="px-4 py-2.5 text-cyan-300">Run #{runA.runNumber}</th>
              <th className="px-4 py-2.5 text-purple-300">Run #{runB.runNumber}</th>
              <th className="px-4 py-2.5 text-right">Net Delta (A vs B)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {/* Code Coverage */}
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 text-slate-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Statement Coverage</span>
              </td>
              <td className="px-4 py-2.5 font-bold text-white">
                {runA.summary.coveragePct.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-slate-300">
                {runB.summary.coveragePct.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-right">
                {renderDeltaPill(covDiff, true, '%')}
              </td>
            </tr>

            {/* Mutation Score */}
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 text-slate-300 flex items-center gap-2">
                <Dna className="h-4 w-4 text-purple-400" />
                <span>Mutation Testing Score</span>
              </td>
              <td className="px-4 py-2.5 font-bold text-white">
                {runA.summary.mutationScore.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-slate-300">
                {runB.summary.mutationScore.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-right">
                {renderDeltaPill(mutDiff, true, '%')}
              </td>
            </tr>

            {/* Defects Detected */}
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 text-slate-300 flex items-center gap-2">
                <Bug className="h-4 w-4 text-rose-400" />
                <span>Defects Flagged</span>
              </td>
              <td className="px-4 py-2.5 font-bold text-white">
                {runA.summary.bugsDetected}
              </td>
              <td className="px-4 py-2.5 text-slate-300">
                {runB.summary.bugsDetected}
              </td>
              <td className="px-4 py-2.5 text-right">
                {renderDeltaPill(bugDiff, false, ' bugs')}
              </td>
            </tr>

            {/* Synthesized Tests */}
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 text-slate-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Synthesized Tests</span>
              </td>
              <td className="px-4 py-2.5 font-bold text-white">
                {runA.summary.testsGenerated}
              </td>
              <td className="px-4 py-2.5 text-slate-300">
                {runB.summary.testsGenerated}
              </td>
              <td className="px-4 py-2.5 text-right">
                {renderDeltaPill(testDiff, true, ' tests')}
              </td>
            </tr>

            {/* Execution Efficiency */}
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>Execution Duration</span>
              </td>
              <td className="px-4 py-2.5 font-bold text-white">
                {runA.durationSeconds}s
              </td>
              <td className="px-4 py-2.5 text-slate-300">
                {runB.durationSeconds}s
              </td>
              <td className="px-4 py-2.5 text-right">
                {renderDeltaPill(durDiff, false, 's')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
