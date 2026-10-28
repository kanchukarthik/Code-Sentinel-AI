import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { PipelineFlowGraph } from '../components/pipeline/PipelineFlowGraph';
import { AgentDetailsModal } from '../components/pipeline/AgentDetailsModal';
import { LogViewer } from '../components/common/LogViewer';
import { StatusBadge } from '../components/common/StatusBadge';
import { PipelineStage } from '../types/pipeline';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  GitBranch,
  GitCommit,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const LivePipelinePage: React.FC = () => {
  const {
    activeRun,
    isSimulating,
    simulationSpeed,
    setSimulationSpeed,
    triggerNewRun,
    pauseSimulation,
    resumeSimulation,
    resetToDefaultRun,
    logs,
    isLogsPaused,
    setIsLogsPaused,
    clearLogs,
    selectedAgentForDetail,
    setSelectedAgentForDetail,
  } = usePipeline();

  const [inspectStage, setInspectStage] = useState<PipelineStage | null>(null);

  // Calculate totals
  const totalTokens = activeRun.stages.reduce((acc, s) => acc + s.telemetry.tokensUsed, 0);
  const totalArtifacts = activeRun.stages.reduce((acc, s) => acc + s.artifactsGenerated.length, 0);
  const activeAgent = activeRun.stages.find((s) => s.status === 'running');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Run Summary Top Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Metadata */}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Multi-Agent Pipeline Run #{activeRun.runNumber}</span>
              </h2>
              <StatusBadge status={activeRun.status} size="md" />
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {activeRun.commitMessage}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 rounded-md bg-slate-950 px-2 py-1 border border-slate-800">
                <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                <span>{activeRun.branch}</span>
              </span>

              <span className="flex items-center gap-1.5 rounded-md bg-slate-950 px-2 py-1 border border-slate-800">
                <GitCommit className="h-3.5 w-3.5 text-cyan-400" />
                <span>{activeRun.commitHash.substring(0, 7)}</span>
              </span>

              <span className="flex items-center gap-1.5 rounded-md bg-slate-950 px-2 py-1 border border-slate-800">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Started: {activeRun.startedAt}</span>
              </span>

              <span className="flex items-center gap-1.5 rounded-md bg-slate-950 px-2 py-1 border border-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Tokens: {(totalTokens / 1000).toFixed(1)}k</span>
              </span>

              <span className="flex items-center gap-1.5 rounded-md bg-slate-950 px-2 py-1 border border-slate-800">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Artifacts: {totalArtifacts}</span>
              </span>
            </div>
          </div>

          {/* Interactive Simulation & Execution Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-mono">
              <span className="px-2 text-[10px] text-slate-500 uppercase">Speed</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`rounded-lg px-2 py-1 transition-colors ${
                    simulationSpeed === spd
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Pause / Resume simulation */}
            {isSimulating ? (
              <button
                onClick={pauseSimulation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors shadow-sm"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Run</span>
              </button>
            ) : activeRun.status === 'running' ? (
              <button
                onClick={resumeSimulation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-cyan-300" />
                <span>Resume Run</span>
              </button>
            ) : null}

            {/* Reset Button */}
            <button
              onClick={resetToDefaultRun}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            {/* Start Fresh Run */}
            <button
              onClick={triggerNewRun}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Trigger Pipeline</span>
            </button>
          </div>
        </div>

        {/* Live Active Status Alert */}
        {isSimulating && activeAgent && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2.5 text-xs text-cyan-300 animate-pulse">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Currently Executing: <strong>Stage 0{activeAgent.order} &mdash; {activeAgent.name}</strong></span>
            </span>
            <span className="font-mono text-[11px] text-cyan-400">
              {activeAgent.currentAction}
            </span>
          </div>
        )}
      </div>

      {/* 7-Agent DAG Graph Component */}
      <PipelineFlowGraph onSelectStage={(stage) => setInspectStage(stage)} />

      {/* Live Log Stream Console */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Agent Orchestration Terminal Stream</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Direct multiplexed output from all 7 cognitive agents
          </span>
        </div>

        <LogViewer
          logs={logs}
          isPaused={isLogsPaused}
          onTogglePause={setIsLogsPaused}
          onClearLogs={clearLogs}
          maxHeight="h-[420px]"
        />
      </div>

      {/* Stage Detail Inspector Modal */}
      <AgentDetailsModal
        stage={inspectStage}
        onClose={() => setInspectStage(null)}
      />
    </div>
  );
};
