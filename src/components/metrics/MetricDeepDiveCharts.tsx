import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ShieldCheck,
  Dna,
  Bug,
  Flame,
  AlertOctagon,
  Sparkles,
  Clock,
} from 'lucide-react';

export const MetricDeepDiveCharts: React.FC = () => {
  const { metricTrends } = usePipeline();

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 font-mono text-xs shadow-xl backdrop-blur-sm">
          <div className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-0.5">
            {label}
          </div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: item.color }}>{item.name}:</span>
              <span className="font-bold text-white">
                {item.value}
                {item.unit || '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Code Coverage & Mutation Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">
                Code Coverage & Mutation Score (%)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Target: &gt;85%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="codeCoveragePct"
                  name="Statement Coverage"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="mutationScore"
                  name="Mutation Score"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Defect Detection Rate & Fault Localization Accuracy */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white">
                Defect Detection & Top-1 Fault Localization (%)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">SBFL Ochiai</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 100]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="defectDetectionRate"
                  name="Defect Detection Rate"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="faultLocalizationAccuracy"
                  name="Top-1 SBFL Accuracy"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. False-Positive Rate (Decreasing is Good) & Patch Success Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                False-Positive Rate & Patch Success Rate (%)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">FP Down to 2.4%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="patchSuccessRate"
                  name="Patch Success Rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="falsePositiveRate"
                  name="False-Positive Rate"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Execution Efficiency (Pipeline Wall-Clock Duration in Seconds) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">
                Pipeline Execution Efficiency (Seconds)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">58% Speedup</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="s" />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="executionEfficiencySec"
                  name="Duration (Seconds)"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
