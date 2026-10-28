import React from 'react';
import { TestCategory, TestStatus } from '../../types/testSynthesis';
import { Search, Filter, FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const TestFilterBar: React.FC<TestFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}) => {
  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'boundary', label: 'Boundary' },
    { id: 'functional', label: 'Functional' },
    { id: 'negative', label: 'Negative' },
    { id: 'regression', label: 'Regression' },
    { id: 'exception-handling', label: 'Exception' },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by test name, target file, or function..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          <span className="px-2 text-[10px] text-slate-500 font-mono uppercase">Status</span>
          {['ALL', 'passed', 'failed', 'flaky'].map((st) => (
            <button
              key={st}
              onClick={() => onSelectStatus(st)}
              className={`rounded-lg px-2.5 py-1 capitalize font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Count Pill */}
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-cyan-400 font-bold">{filteredCount}</span> of {totalCount} tests
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
        <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mr-1">
          <Filter className="h-3 w-3" />
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-950'
                : 'border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
