import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface LearnedRule {
  id: string;
  category: string;
  ruleTitle: string;
  description: string;
  sourceBug: string;
  timesApplied: number;
  successRate: number;
  confidenceScore: number;
}

const LEARNED_RULES: LearnedRule[] = [
  {
    id: 'RULE-101',
    category: 'Zero Division Guard',
    ruleTitle: 'Validate denominators prior to reciprocal division',
    description: 'When computing harmonic means or frequency inversions, enforce x > 0 guard and raise ValueError rather than allowing ZeroDivisionError.',
    sourceBug: 'BUG-401 (harmonic_mean)',
    timesApplied: 8,
    successRate: 100,
    confidenceScore: 0.98,
  },
  {
    id: 'RULE-102',
    category: 'Null Dereference Protection',
    ruleTitle: 'Null-safe attribute dereferencing for optional parameters',
    description: 'When functions accept optional dataclass or object arguments (e.g. voucher=None), check `if voucher is not None:` before accessing fields.',
    sourceBug: 'BUG-402 (apply_discount)',
    timesApplied: 6,
    successRate: 100,
    confidenceScore: 0.96,
  },
  {
    id: 'RULE-103',
    category: 'Boundary Clamping',
    ruleTitle: 'Percentage parameter bounds validation',
    description: 'Clamp percentage discounts and ratios within the inclusive range [0.0, 100.0] before applying arithmetic multipliers.',
    sourceBug: 'BUG-403 (discount_clamp)',
    timesApplied: 5,
    successRate: 85,
    confidenceScore: 0.91,
  },
  {
    id: 'RULE-104',
    category: 'Floating Point Precision',
    ruleTitle: 'Financial currency rounding to 2 decimal places',
    description: 'Use decimal.Decimal or explicit round(val, 2) when returning currency values under compound compounding intervals.',
    sourceBug: 'BUG-404 (compound_interest)',
    timesApplied: 4,
    successRate: 100,
    confidenceScore: 0.95,
  },
];

const STRATEGY_DATA = [
  { iteration: 'Run 101 (Baseline)', successRate: 50, promptTokens: 3200 },
  { iteration: 'Run 102 (+ SBFL Slice)', successRate: 75, promptTokens: 2800 },
  { iteration: 'Run 103 (+ AST Boundary)', successRate: 100, promptTokens: 2450 },
  { iteration: 'Current Target', successRate: 100, promptTokens: 2100 },
];

export const FeedbackLoopPage: React.FC = () => {
  const { activeRun } = usePipeline();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRules = LEARNED_RULES.filter(
    (r) => selectedCategory === 'all' || r.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
            Adaptive Learning & Feedback Loop
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Agent 7 feedback knowledge base: longitudinal prompt strategy refinement and validated repair heuristics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Active Continuous Learning Enabled
          </span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Learned Heuristics</div>
          <div className="text-3xl font-bold text-white flex items-baseline gap-2">
            4 <span className="text-xs font-normal text-emerald-400">+2 from last run</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Patch Acceptance Rate</div>
          <div className="text-3xl font-bold text-emerald-400 flex items-baseline gap-2">
            96.2% <span className="text-xs font-normal text-slate-400">across 23 patches</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Token Reduction</div>
          <div className="text-3xl font-bold text-cyan-400 flex items-baseline gap-2">
            -34.4% <span className="text-xs font-normal text-slate-400">few-shot efficiency</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Auto-Heal Convergence</div>
          <div className="text-3xl font-bold text-indigo-400 flex items-baseline gap-2">
            1.2 iter <span className="text-xs font-normal text-slate-400">avg repair loops</span>
          </div>
        </div>
      </div>

      {/* Strategy Evolution Chart & Feedback Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Repair Strategy Convergence Over Runs
            </h3>
            <span className="text-xs text-slate-400 font-mono">Feedback Memory: Persistent</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={STRATEGY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="iteration" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By feeding back verified patch unified diffs and rejection rationale into subsequent prompts, the agent achieves a 100% first-attempt repair success rate on boundary and null-dereference faults.
          </p>
        </div>

        {/* Feedback Loop Explanation */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Self-Healing Loop Anatomy
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <span className="font-semibold text-white">Execution Verification:</span>
                  <p className="text-slate-400 mt-0.5">Isolated sandbox tests synthesized patch against regression suite.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <span className="font-semibold text-white">Heuristic Extraction:</span>
                  <p className="text-slate-400 mt-0.5">Successful repairs generate generalized defensive patterns.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <span className="font-semibold text-white">Continuous Knowledge Store:</span>
                  <p className="text-slate-400 mt-0.5">Future runs prime LLM prompts with project-specific proven fixes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono text-center">
            Database Table: <code>feedback_records</code>
          </div>
        </div>
      </div>

      {/* Learned Rules Table */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Active Heuristic Rule Repository
          </h3>
          <span className="text-xs text-slate-400 font-mono">{filteredRules.length} rules active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {rule.id}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {rule.successRate}% Success
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{rule.ruleTitle}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Derived from: {rule.sourceBug}</span>
                <span>Applied {rule.timesApplied} times</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
