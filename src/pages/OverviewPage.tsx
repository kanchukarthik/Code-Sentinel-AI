import React from 'react';
import { ActivePipelineBanner } from '../components/overview/ActivePipelineBanner';
import { MetricSummaryGrid } from '../components/overview/MetricSummaryGrid';
import { QualityTrendCharts } from '../components/overview/QualityTrendCharts';
import { RecentRunsTable } from '../components/overview/RecentRunsTable';
import { usePipeline } from '../context/PipelineContext';
import { ShieldCheck, Sparkles, Terminal, Activity, ArrowUpRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { activeRepo } = usePipeline();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Autonomous Engineering Center</span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/30">
              {activeRepo.name}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry, test synthesis velocity, defect diagnosis, and self-healing repair status
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>7 Agents Coordinated</span>
        </div>
      </div>

      {/* Active Pipeline Status Banner */}
      <ActivePipelineBanner />

      {/* Primary 5 KPI Metrics */}
      <MetricSummaryGrid />

      {/* Quality Dynamic Trend Charts */}
      <QualityTrendCharts />

      {/* Recent Pipeline Runs Table */}
      <RecentRunsTable />
    </div>
  );
};
