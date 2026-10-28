import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import {
  Cpu,
  GitBranch,
  Network,
  FileCode,
  Flame,
  CheckCircle,
  AlertTriangle,
  Code2,
  Share2,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ComplexityHotspot {
  file: string;
  function: string;
  line: number;
  complexity: number;
  argsCount: number;
  risk: 'critical' | 'high' | 'moderate' | 'low';
}

const HOTSPOTS: ComplexityHotspot[] = [
  { file: 'calculator.py', function: 'harmonic_mean', line: 42, complexity: 14, argsCount: 2, risk: 'critical' },
  { file: 'cart.py', function: 'apply_discount', line: 88, complexity: 13, argsCount: 2, risk: 'critical' },
  { file: 'calculator.py', function: 'compound_interest', line: 55, complexity: 11, argsCount: 4, risk: 'high' },
  { file: 'cart.py', function: 'calculate_tax_breakdown', line: 112, complexity: 9, argsCount: 3, risk: 'moderate' },
  { file: 'calculator.py', function: 'percentile', line: 74, complexity: 8, argsCount: 2, risk: 'moderate' },
  { file: 'cart.py', function: 'add_item', line: 30, complexity: 4, argsCount: 3, risk: 'low' },
  { file: 'calculator.py', function: 'add', line: 12, complexity: 2, argsCount: 2, risk: 'low' },
];

const MODULE_NODES = [
  { id: 'calculator.py', type: 'core', functions: 6, lines: 95, callers: 2, status: 'defect_identified' },
  { id: 'cart.py', type: 'core', functions: 8, lines: 140, callers: 3, status: 'defect_identified' },
  { id: 'test_calculator.py', type: 'test', functions: 5, lines: 65, callers: 0, status: 'passing' },
  { id: 'test_cart.py', type: 'test', functions: 4, lines: 50, callers: 0, status: 'passing' },
  { id: 'test_harmonic_mean_zero.py', type: 'synthesized', functions: 1, lines: 20, callers: 0, status: 'failing' },
  { id: 'test_cart_discount_clamp.py', type: 'synthesized', functions: 1, lines: 25, callers: 0, status: 'failing' },
];

export const CodeIntelligencePage: React.FC = () => {
  const { activeRun } = usePipeline();
  const [selectedFile, setSelectedFile] = useState<string>('calculator.py');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredHotspots = HOTSPOTS.filter(
    (h) => filterRisk === 'all' || h.risk === filterRisk
  );

  const chartData = HOTSPOTS.map((h) => ({
    name: `${h.function}()`,
    complexity: h.complexity,
    risk: h.risk,
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return '#f43f5e';
      case 'high':
        return '#f97316';
      case 'moderate':
        return '#eab308';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Cpu className="w-8 h-8 text-cyan-400" />
            Code Intelligence & AST Knowledge Graph
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Agent 1 output: Abstract Syntax Tree parsing, dependency topology, and McCabe cyclomatic complexity hotspots.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
            Run: {activeRun.id}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
            AST Depth: 7 Levels
          </span>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">6 Modules</div>
            <div className="text-xs text-slate-400">AST Parsed Files</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400">3 Hotspots</div>
            <div className="text-xs text-slate-400">Complexity &gt; 10</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">12 Edges</div>
            <div className="text-xs text-slate-400">Dependency Links</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">88.6%</div>
            <div className="text-xs text-slate-400">Structural Coverage</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Hotspots & Dependency Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complexity Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Cyclomatic Complexity Profile
            </h3>
            <span className="text-xs text-slate-400 font-mono">McCabe Threshold = 10</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="complexity" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hotspots Detailed Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Complexity Hotspots Breakdown</h4>
              <div className="flex items-center gap-1.5">
                {['all', 'critical', 'high', 'moderate'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterRisk(lvl)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                      filterRisk === lvl
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Function</th>
                    <th className="p-3">File : Line</th>
                    <th className="p-3">Cyclomatic CC</th>
                    <th className="p-3">Args</th>
                    <th className="p-3">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredHotspots.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono font-semibold text-cyan-300">
                        {item.function}()
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {item.file}:{item.line}
                      </td>
                      <td className="p-3 font-bold font-mono">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            item.complexity >= 10
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {item.complexity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{item.argsCount}</td>
                      <td className="p-3">
                        <span
                          className="capitalize font-semibold text-[11px]"
                          style={{ color: getRiskColor(item.risk) }}
                        >
                          ● {item.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Module Dependency Network Visualizer */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Network className="w-5 h-5 text-indigo-400" />
              Module Topology Map
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              AST call-graph relationships between target implementations and test suites.
            </p>

            <div className="space-y-3">
              {MODULE_NODES.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedFile(node.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFile === node.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      {node.id}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                        node.status === 'defect_identified'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : node.status === 'failing'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{node.functions} functions</span>
                    <span>{node.lines} LOC</span>
                    <span className="text-indigo-300 font-mono">{node.callers} inbound refs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Agent 1 Synthesis Target Guidance
            </div>
            <p className="text-[11px] leading-relaxed">
              Functions with high McCabe complexity and 0 dedicated boundary unit tests are flagged as priority targets for the Test Synthesis Agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
