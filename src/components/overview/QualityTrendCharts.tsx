import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const QualityTrendCharts: React.FC = () => {
  const { metricTrends } = usePipeline();
  const [chartView, setChartView] = useState<'coverage' | 'quality'>('coverage');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
          <div className="font-semibold text-slate-300 mb-1.5 border-b border-slate-800 pb-1">
            Run #{payload[0].payload.runNumber} ({label})
          </div>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-bold text-white">
                  {item.value}
                  {item.unit || '%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              Autonomous Quality Dynamics (Last 8 Pipeline Runs)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Self-reinforcing test synthesis & repair trajectory
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setChartView('coverage')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              chartView === 'coverage'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Coverage vs Mutation
          </button>
          <button
            onClick={() => setChartView('quality')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              chartView === 'quality'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Defect Detection & Patch Success
          </button>
        </div>
      </div>

      {/* Recharts graph */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'coverage' ? (
            <AreaChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="covGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="mutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="codeCoveragePct"
                name="Code Coverage"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#covGradient)"
              />
              <Area
                type="monotone"
                dataKey="mutationScore"
                name="Mutation Score"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#mutGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={metricTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="defectDetectionRate"
                name="Defect Detection Rate"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f43f5e' }}
              />
              <Line
                type="monotone"
                dataKey="patchSuccessRate"
                name="Patch Success Rate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="faultLocalizationAccuracy"
                name="Fault Loc. Top-1"
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
