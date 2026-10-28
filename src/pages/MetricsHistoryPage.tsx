import React from 'react';
import { usePipeline } from '../context/PipelineContext';
import { RunComparisonView } from '../components/metrics/RunComparisonView';
import { MetricDeepDiveCharts } from '../components/metrics/MetricDeepDiveCharts';
import {
  BarChart3,
  ShieldCheck,
  Dna,
  Bug,
  Flame,
  AlertOctagon,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const MetricsHistoryPage: React.FC = () => {
  const { metricTrends } = usePipeline();
  const latestMetric = metricTrends[metricTrends.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>Autonomous System Evaluation & History</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-run benchmarks across CodeSentinel's 7 evaluation criteria & side-by-side comparator
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>Latest Run: #{latestMetric.runNumber} ({latestMetric.commitShort})</span>
        </div>
      </div>

      {/* 7 System Evaluation Criteria Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 font-mono text-xs">
        {/* 1. Code Coverage */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Coverage</span>
          <span className="text-base font-bold text-cyan-400">
            {latestMetric.codeCoveragePct}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">+20.4% total</span>
        </div>

        {/* 2. Mutation Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Mutation Score</span>
          <span className="text-base font-bold text-purple-400">
            {latestMetric.mutationScore}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">+24.8% total</span>
        </div>

        {/* 3. Defect Detection */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Defect Rate</span>
          <span className="text-base font-bold text-rose-400">
            {latestMetric.defectDetectionRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">high sensitivity</span>
        </div>

        {/* 4. Fault Localization */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Top-1 SBFL</span>
          <span className="text-base font-bold text-amber-400">
            {latestMetric.faultLocalizationAccuracy}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ochiai ranked</span>
        </div>

        {/* 5. False Positive Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">False Positives</span>
          <span className="text-base font-bold text-emerald-400">
            {latestMetric.falsePositiveRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">ultra low</span>
        </div>

        {/* 6. Patch Success */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Patch Success</span>
          <span className="text-base font-bold text-cyan-300">
            {latestMetric.patchSuccessRate}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">dual verified</span>
        </div>

        {/* 7. Execution Efficiency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <span className="text-[10px] text-slate-500 block mb-1">Duration</span>
          <span className="text-base font-bold text-white">
            {latestMetric.executionEfficiencySec}s
          </span>
          <span className="text-[10px] text-cyan-400 block mt-0.5">58% faster</span>
        </div>
      </div>

      {/* Side-by-Side Run Comparator */}
      <RunComparisonView />

      {/* Comprehensive Evaluation Deep Dive Charts */}
      <MetricDeepDiveCharts />
    </div>
  );
};
