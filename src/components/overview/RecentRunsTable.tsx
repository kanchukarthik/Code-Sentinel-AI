import React from 'react';
import { Link } from 'react-router-dom';
import { usePipeline } from '../../context/PipelineContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  GitCommit,
  GitBranch,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const RecentRunsTable: React.FC = () => {
  const { historicalRuns, activeRun } = usePipeline();

  const allRuns = [
    activeRun,
    ...historicalRuns.filter((r) => r.id !== activeRun.id),
  ].slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/40">
        <div>
          <h4 className="text-sm font-bold text-slate-100">
            Recent Pipeline Runs
          </h4>
          <p className="text-xs text-slate-400">
            Audit trail of autonomous test synthesis & self-healing runs
          </p>
        </div>

        <Link
          to="/metrics"
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All History</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Run</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Branch & Commit</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Coverage / Mutation</th>
              <th className="px-4 py-3">Defects</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {allRuns.map((run) => (
              <tr
                key={run.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Run Number */}
                <td className="px-5 py-3 font-semibold text-white">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-cyan-300">
                    #{run.runNumber}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={run.status} size="sm" />
                </td>

                {/* Branch & Commit */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                    <span className="font-medium max-w-[120px] truncate">{run.branch}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <GitCommit className="h-3 w-3" />
                    <span>{run.commitHash.substring(0, 7)}</span>
                  </div>
                </td>

                {/* Trigger */}
                <td className="px-4 py-3 text-slate-400 capitalize">
                  {run.trigger.replace('_', ' ')}
                </td>

                {/* Coverage & Mutation */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      {run.summary.coveragePct.toFixed(1)}%
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-purple-400 font-semibold">
                      {run.summary.mutationScore.toFixed(1)}%
                    </span>
                  </div>
                </td>

                {/* Defects */}
                <td className="px-4 py-3">
                  {run.summary.bugsDetected > 0 ? (
                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-400 font-semibold border border-rose-500/20">
                      {run.summary.bugsDetected} detected
                    </span>
                  ) : (
                    <span className="text-slate-500">0 defects</span>
                  )}
                </td>

                {/* Duration */}
                <td className="px-4 py-3 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{run.durationSeconds}s</span>
                  </div>
                </td>

                {/* Action Link */}
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/pipeline"
                    className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
