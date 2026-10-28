import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePipeline } from '../../context/PipelineContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Cpu,
  FlaskConical,
  Bug,
  SearchCode,
  Sparkles,
  BarChart3,
  BrainCircuit,
  Settings,
  Activity,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isSimulating, activeRun, detectedBugs, candidatePatches, synthesizedTests } = usePipeline();

  const openBugsCount = detectedBugs.filter((b) => b.status === 'open' || b.status === 'patch-ready').length;
  const candidatePatchesCount = candidatePatches.filter((p) => p.status === 'candidate').length;

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/projects',
      label: 'Target Codebases',
      icon: FolderGit2,
      badge: '2',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      to: '/pipeline',
      label: 'Live Pipeline DAG',
      icon: GitBranch,
      isLive: isSimulating || activeRun.status === 'running',
      badge: isSimulating ? 'Active' : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      to: '/code-intelligence',
      label: 'Code Intelligence',
      icon: Cpu,
      badge: 'AST',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      to: '/tests',
      label: 'Test Synthesis',
      icon: FlaskConical,
      badge: `${synthesizedTests.length || 3}`,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      to: '/bugs',
      label: 'Bug Discovery',
      icon: Bug,
      badge: openBugsCount > 0 ? `${openBugsCount}` : '2',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      to: '/root-cause',
      label: 'Root Cause & SBFL',
      icon: SearchCode,
      badge: 'Ochiai',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      to: '/patches',
      label: 'Self-Healing & Patches',
      icon: Sparkles,
      badge: candidatePatchesCount > 0 ? `${candidatePatchesCount}` : '1',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      to: '/metrics',
      label: 'Metrics & Evaluation',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/feedback',
      label: 'Feedback Learning',
      icon: BrainCircuit,
      badge: 'Heuristics',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      to: '/settings',
      label: 'Engine Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col justify-between border-r border-slate-800 bg-[#090d16] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-900/30 text-white shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                CodeSentinel
              </h1>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              7-Agent Cognitive Mesh
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 p-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation Menu (11 Modules)
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/30 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Badge or pulse */}
                {item.isLive ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-mono text-cyan-300 animate-pulse shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    LIVE
                  </span>
                ) : item.badge ? (
                  <span
                    className={`rounded border px-1.5 py-0.2 text-[10px] font-mono font-medium shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/40 shrink-0">
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="h-3 w-3 text-emerald-400" />
              Cognitive Mesh
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
              ONLINE
            </span>
          </div>

          <div className="mt-2 space-y-1 text-[10px] text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Agents:</span>
              <span className="text-slate-300">7 Active</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Engine:</span>
              <span className="text-cyan-300">Claude 3.7 / Mock</span>
            </div>
            <div className="flex justify-between">
              <span>SBFL Algorithm:</span>
              <span className="text-slate-300">Ochiai (Top-1)</span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-slate-600 font-mono">
          CodeSentinel AI v1.0.0
        </div>
      </div>
    </aside>
  );
};
