import React from 'react';
import { PipelineStage } from '../../types/pipeline';
import { StatusBadge } from './StatusBadge';
import { Cpu, Clock, Terminal, ChevronRight, Sparkles, FileCode2 } from 'lucide-react';

interface AgentStageCardProps {
  stage: PipelineStage;
  isActive?: boolean;
  onInspect?: (stage: PipelineStage) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const AgentStageCard: React.FC<AgentStageCardProps> = ({
  stage,
  isActive = false,
  onInspect,
  orientation = 'horizontal',
  className = '',
}) => {
  const isRunning = stage.status === 'running';
  const isPassed = stage.status === 'passed';
  const isFailed = stage.status === 'failed';

  const cardBorderClass = isRunning
    ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 ring-2 ring-cyan-500/30'
    : isPassed
    ? 'border-emerald-500/30 hover:border-emerald-500/60'
    : isFailed
    ? 'border-rose-500/40 hover:border-rose-500/70'
    : 'border-slate-800 hover:border-slate-700';

  const cardBgClass = isRunning
    ? 'bg-gradient-to-b from-cyan-950/20 via-slate-900 to-slate-900'
    : 'bg-slate-900/80 hover:bg-slate-900';

  return (
    <div
      onClick={() => onInspect?.(stage)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${cardBorderClass} ${cardBgClass} ${className}`}
    >
      {/* Top Header: Order, Name, Status */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 font-mono text-[10px] font-bold text-slate-400">
              0{stage.order}
            </span>
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
              {stage.name}
            </h4>
          </div>
          <StatusBadge status={stage.status} size="sm" />
        </div>

        <p className="mt-1 text-xs text-slate-400 line-clamp-1">
          {stage.shortRole}
        </p>
      </div>

      {/* Real-time progress bar if running */}
      {isRunning && (
        <div className="my-2.5">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono mb-1">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              Executing cognitive pass...
            </span>
            <span>{stage.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 animate-pulse"
              style={{ width: `${Math.max(15, stage.progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Current action ticker */}
      <div className="my-2 rounded bg-slate-950/60 p-2 text-[11px] font-mono text-slate-300 border border-slate-800/60">
        <div className="flex items-start gap-1.5 text-slate-400">
          <Terminal className="h-3 w-3 mt-0.5 text-cyan-400 flex-shrink-0" />
          <span className="line-clamp-2 leading-relaxed text-slate-300">
            {stage.currentAction}
          </span>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 text-[10px] text-slate-400">
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1" title="Execution duration">
            <Clock className="h-3 w-3 text-slate-500" />
            {(stage.telemetry.executionTimeMs / 1000).toFixed(1)}s
          </span>

          {stage.telemetry.tokensUsed > 0 && (
            <span className="flex items-center gap-1" title="LLM Tokens consumed">
              <Sparkles className="h-3 w-3 text-cyan-400/80" />
              {(stage.telemetry.tokensUsed / 1000).toFixed(1)}k tok
            </span>
          )}

          {stage.artifactsGenerated.length > 0 && (
            <span className="flex items-center gap-1" title="Artifacts generated">
              <FileCode2 className="h-3 w-3 text-slate-500" />
              {stage.artifactsGenerated.length}
            </span>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center text-xs text-slate-400 group-hover:text-cyan-400 transition-colors"
        >
          <span>Inspect</span>
          <ChevronRight className="h-3.5 w-3.5 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
