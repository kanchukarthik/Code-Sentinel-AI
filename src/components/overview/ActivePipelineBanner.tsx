import React from 'react';
import { Link } from 'react-router-dom';
import { usePipeline } from '../../context/PipelineContext';
import { StatusBadge } from '../common/StatusBadge';
import { Play, ArrowRight, ShieldAlert, Cpu, Sparkles, Clock } from 'lucide-react';

export const ActivePipelineBanner: React.FC = () => {
  const { activeRun, isSimulating } = usePipeline();

  const runningStage = activeRun.stages.find((s) => s.status === 'running');
  const lastPassedStage = [...activeRun.stages].reverse().find((s) => s.status === 'passed');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 p-5 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-base font-bold text-white tracking-tight">
              {isSimulating ? 'Autonomous Pipeline in Progress' : `Active Pipeline Run #${activeRun.runNumber}`}
            </h3>
            <StatusBadge status={activeRun.status} size="sm" />
          </div>

          <p className="text-xs text-slate-300">
            {runningStage ? (
              <span className="font-mono text-cyan-300">
                Agent Active: [{runningStage.name}] &mdash; {runningStage.currentAction}
              </span>
            ) : (
              <span className="text-slate-400">
                Target: <code className="text-slate-200 font-mono">{activeRun.branch}</code> ({activeRun.commitHash.substring(0, 7)}) &bull; Triggered by {activeRun.trigger}
              </span>
            )}
          </p>

          {/* Micro Progress Bar across 7 agents */}
          <div className="flex items-center gap-1.5 pt-1">
            {activeRun.stages.map((stage) => {
              const isDone = stage.status === 'passed';
              const isCur = stage.status === 'running';
              const isFail = stage.status === 'failed';
              return (
                <div
                  key={stage.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-400'
                      : isCur
                      ? 'bg-cyan-400 animate-pulse'
                      : isFail
                      ? 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  title={`${stage.name}: ${stage.status}`}
                />
              );
            })}
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono text-[11px] text-slate-400">
            <span>Duration: {activeRun.durationSeconds}s</span>
            <span className="text-cyan-400">14 tests synthesized</span>
          </div>

          <Link
            to="/pipeline"
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 hover:text-white transition-all shadow-sm"
          >
            <span>Open Live Pipeline View</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
