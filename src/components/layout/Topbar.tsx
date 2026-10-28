import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { useTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  GitBranch,
  GitCommit,
  Play,
  RotateCcw,
  Sun,
  Moon,
  FolderGit2,
  Gauge,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    repositories,
    activeRepo,
    setActiveRepoId,
    activeRun,
    isSimulating,
    simulationSpeed,
    setSimulationSpeed,
    triggerNewRun,
    resetToDefaultRun,
  } = usePipeline();

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-[#0a0e17]/90 px-6 backdrop-blur-md">
      {/* Left section: Repo & Branch Selector */}
      <div className="flex items-center gap-3">
        {/* Repo Dropdown */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200">
          <FolderGit2 className="h-4 w-4 text-cyan-400" />
          <select
            value={activeRepo.id}
            onChange={(e) => setActiveRepoId(e.target.value)}
            className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id} className="bg-slate-900 text-slate-200">
                {repo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-mono text-slate-300">
          <GitBranch className="h-3.5 w-3.5 text-purple-400" />
          <span className="max-w-[140px] truncate">{activeRepo.activeBranch}</span>
        </div>

        {/* Commit Hash pill */}
        <div className="hidden md:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1.5 text-xs font-mono text-slate-400">
          <GitCommit className="h-3.5 w-3.5 text-slate-500" />
          <span>{activeRun.commitHash.substring(0, 7)}</span>
        </div>

        {/* Active Run Status Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
          <span className="text-[11px] text-slate-400">Run #{activeRun.runNumber}:</span>
          <StatusBadge status={activeRun.status} size="sm" />
        </div>
      </div>

      {/* Right section: Simulation controls, Theme toggle */}
      <div className="flex items-center gap-2.5">
        {/* Simulation Speed Pill */}
        {isSimulating && (
          <div className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40 p-1 text-[11px] font-mono text-cyan-300">
            <Gauge className="h-3 w-3 text-cyan-400 ml-1" />
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  simulationSpeed === speed
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-cyan-300 hover:bg-cyan-900/50'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}

        {/* Reset Demo button */}
        <button
          onClick={resetToDefaultRun}
          disabled={isSimulating}
          className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Reset back to baseline Demo Run #142"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Demo</span>
        </button>

        {/* Trigger Autonomous Run button */}
        <button
          onClick={triggerNewRun}
          disabled={isSimulating}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all ${
            isSimulating
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-not-allowed animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 active:scale-95 shadow-cyan-950/50'
          }`}
        >
          <Play className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : 'fill-white'}`} />
          <span>{isSimulating ? 'Simulating Pipeline...' : 'Run Pipeline'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
