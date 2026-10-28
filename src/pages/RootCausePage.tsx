import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import {
  SearchCode,
  Flame,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCode,
  Zap,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface RankingStatement {
  rank: number;
  file: string;
  line: number;
  score: number;
  code: string;
  isSuspect: boolean;
  failedTestsCovering: number;
  passedTestsCovering: number;
  explanation: string;
}

const SAMPLE_RANKINGS: RankingStatement[] = [
  {
    rank: 1,
    file: 'calculator.py',
    line: 45,
    score: 0.962,
    code: 'sum_reciprocals += 1.0 / x',
    isSuspect: true,
    failedTestsCovering: 1,
    passedTestsCovering: 0,
    explanation: 'Direct reciprocal computation executes without checking if x == 0. When dataset includes zero, throws uncaught ZeroDivisionError.',
  },
  {
    rank: 2,
    file: 'cart.py',
    line: 92,
    score: 0.941,
    code: "if voucher.code.startswith('VIP'):",
    isSuspect: true,
    failedTestsCovering: 1,
    passedTestsCovering: 0,
    explanation: 'Unchecked dereference of optional voucher parameter when voucher is None causes AttributeError.',
  },
  {
    rank: 3,
    file: 'calculator.py',
    line: 43,
    score: 0.740,
    code: 'for x in numbers:',
    isSuspect: true,
    failedTestsCovering: 1,
    passedTestsCovering: 2,
    explanation: 'Iterator loop directly precedes the zero-division fault. Covered by failing execution path.',
  },
  {
    rank: 4,
    file: 'cart.py',
    line: 90,
    score: 0.410,
    code: 'def apply_discount(self, voucher=None):',
    isSuspect: false,
    failedTestsCovering: 1,
    passedTestsCovering: 3,
    explanation: 'Function entry point; executes on all calls regardless of whether voucher is provided.',
  },
  {
    rank: 5,
    file: 'calculator.py',
    line: 41,
    score: 0.320,
    code: 'sum_reciprocals = 0.0',
    isSuspect: false,
    failedTestsCovering: 1,
    passedTestsCovering: 4,
    explanation: 'Accumulator initialization line; executed by all test executions.',
  },
];

const CODE_LINES_VIEW = [
  { line: 40, code: '    def harmonic_mean(self, numbers):', score: 0.15 },
  { line: 41, code: '        sum_reciprocals = 0.0', score: 0.32 },
  { line: 42, code: '        if not numbers:', score: 0.28 },
  { line: 43, code: '            raise ValueError("numbers sequence cannot be empty")', score: 0.0 },
  { line: 44, code: '        for x in numbers:', score: 0.74 },
  { line: 45, code: '            sum_reciprocals += 1.0 / x   # << ROOT CAUSE FAULT', score: 0.962 },
  { line: 46, code: '        return len(numbers) / sum_reciprocals', score: 0.22 },
];

export const RootCausePage: React.FC = () => {
  const { activeRun } = usePipeline();
  const [selectedRank, setSelectedRank] = useState<RankingStatement>(SAMPLE_RANKINGS[0]);
  const [metricFormula, setMetricFormula] = useState<'ochiai' | 'tarantula'>('ochiai');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <SearchCode className="w-8 h-8 text-cyan-400" />
            Root-Cause Analysis & SBFL Localization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Agent 5: Mathematical Spectrum-Based Fault Localization (Ochiai & Tarantula algorithms) pinpointing exact fault lines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setMetricFormula('ochiai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              metricFormula === 'ochiai'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ochiai Metric
          </button>
          <button
            onClick={() => setMetricFormula('tarantula')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              metricFormula === 'tarantula'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tarantula Metric
          </button>
        </div>
      </div>

      {/* SBFL Formula Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              {metricFormula === 'ochiai' ? 'Ochiai Suspiciousness Formulation' : 'Tarantula Suspiciousness Formulation'}
            </h3>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-sm text-cyan-300">
            {metricFormula === 'ochiai' ? (
              <span>S_Ochiai(s) = n_cf / √( n_f · (n_cf + n_cs) )</span>
            ) : (
              <span>S_Taran(s) = (n_cf / n_f) / [ (n_cf / n_f) + (n_cs / n_s) ]</span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Where <code className="text-cyan-400">n_cf</code> is failed executions covering statement,{' '}
            <code className="text-cyan-400">n_cs</code> is passed executions covering statement, and{' '}
            <code className="text-cyan-400">n_f</code> is total failed tests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-bold text-white">100.0%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Top-1 Accuracy</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-bold text-cyan-400">100.0%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Top-3 Accuracy</div>
          </div>
        </div>
      </div>

      {/* Main Grid: SBFL Rankings Table + Heatmap Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suspicion Ranking List */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Statement Suspiciousness Rankings (Top 5)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Sorted by score desc</span>
          </div>

          <div className="space-y-3">
            {SAMPLE_RANKINGS.map((item) => (
              <div
                key={item.rank}
                onClick={() => setSelectedRank(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRank.rank === item.rank
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        item.rank === 1
                          ? 'bg-rose-500 text-white'
                          : item.rank === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-semibold">
                      {item.file}:{item.line}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      Score: {item.score.toFixed(3)}
                    </span>
                    {item.isSuspect && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Primary Suspect
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 mb-2 truncate">
                  {item.code}
                </div>

                {/* Progress bar representing suspiciousness */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score > 0.8
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : item.score > 0.5
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Heatmap Inspector & LLM Diagnosis */}
        <div className="lg:col-span-5 space-y-6">
          {/* LLM Slice Diagnosis Explanation */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Agent 5 Slice Diagnosis
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                Target Fault: {selectedRank.file}:{selectedRank.line}
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedRank.explanation}</p>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Failed Tests Executing Statement:</span>
                <span className="font-mono text-rose-400 font-bold">{selectedRank.failedTestsCovering}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Passing Tests Executing Statement:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedRank.passedTestsCovering}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Fault Localization Method:</span>
                <span className="font-mono text-cyan-400">Ochiai Coefficient</span>
              </div>
            </div>
          </div>

          {/* Line Suspicion Heat Overlay */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                calculator.py Heatmap Overlay
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Lines 40-46</span>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-1 overflow-x-auto">
              {CODE_LINES_VIEW.map((item) => (
                <div
                  key={item.line}
                  className={`flex items-center gap-3 px-2 py-1 rounded transition-colors ${
                    item.score > 0.8
                      ? 'bg-rose-500/20 text-rose-200 border-l-2 border-rose-500 font-semibold'
                      : item.score > 0.5
                      ? 'bg-amber-500/10 text-amber-200 border-l-2 border-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-6 text-slate-600 text-right select-none">{item.line}</span>
                  <span className="truncate">{item.code}</span>
                  {item.score > 0.8 && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-bold">
                      {item.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
