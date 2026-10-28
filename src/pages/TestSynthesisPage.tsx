import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { TestFilterBar } from '../components/tests/TestFilterBar';
import { TestDetailDrawer } from '../components/tests/TestDetailDrawer';
import { SynthesizedTest } from '../types/testSynthesis';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FlaskConical,
  FileCode,
  Dna,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
} from 'lucide-react';

export const TestSynthesisPage: React.FC = () => {
  const { synthesizedTests } = usePipeline();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTest, setActiveTest] = useState<SynthesizedTest | null>(null);

  const filteredTests = synthesizedTests.filter((test) => {
    const matchesCategory =
      selectedCategory === 'ALL' || test.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'ALL' || test.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.targetFile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.targetFunction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'boundary':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'negative':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'regression':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'exception-handling':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-cyan-400" />
            <span>Autonomous Test Synthesis Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated generation targeting unexplored control/data flow branches & edge boundaries
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
          <Dna className="h-4 w-4 text-purple-400" />
          <span>Cumulative Mutation Uplift: <strong className="text-emerald-400">+18.4%</strong></span>
        </div>
      </div>

      {/* Filter and search bar */}
      <TestFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={synthesizedTests.length}
        filteredCount={filteredTests.length}
      />

      {/* Tests Table / List */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">ID / Test Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Target Scope</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Execution</th>
                <th className="px-4 py-3.5">Mutation Impact</th>
                <th className="px-4 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => setActiveTest(test)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Test ID & Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-300 border border-slate-700">
                        {test.testKey}
                      </span>
                      <span className="max-w-[220px] truncate">{test.name}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 font-sans line-clamp-1">
                      {test.unexploredPathCoverage}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] capitalize font-medium ${getCategoryBadgeColor(
                        test.category
                      )}`}
                    >
                      {test.category}
                    </span>
                  </td>

                  {/* Target Scope */}
                  <td className="px-4 py-3.5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5 text-slate-500" />
                      <span className="max-w-[150px] truncate">{test.targetFile}</span>
                    </div>
                    <div className="text-[11px] text-cyan-400">
                      {test.targetFunction}()
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={test.status} size="sm" />
                  </td>

                  {/* Execution Duration */}
                  <td className="px-4 py-3.5 text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{test.executionTimeMs} ms</span>
                    </div>
                  </td>

                  {/* Mutation impact */}
                  <td className="px-4 py-3.5">
                    <span className="text-emerald-400 font-bold">
                      +{test.mutationImpactPct}%
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Test Detail Drawer Modal */}
      <TestDetailDrawer
        test={activeTest}
        onClose={() => setActiveTest(null)}
      />
    </div>
  );
};
