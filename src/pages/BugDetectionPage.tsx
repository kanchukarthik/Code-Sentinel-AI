import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { BugDetailView } from '../components/bugs/BugDetailView';
import { DetectedBug } from '../types/bugDetection';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Bug,
  ShieldAlert,
  Search,
  Filter,
  Flame,
  FileCode,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const BugDetectionPage: React.FC = () => {
  const { detectedBugs } = usePipeline();
  const [selectedBugId, setSelectedBugId] = useState<string>(detectedBugs[0]?.id || '');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBugs = detectedBugs.filter((b) => {
    const matchesSev = severityFilter === 'ALL' || b.severity === severityFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetFile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bugKey.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const selectedBug = detectedBugs.find((b) => b.id === selectedBugId) || filteredBugs[0] || null;

  const getSeverityPill = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bug className="h-5 w-5 text-rose-400" />
            <span>Defect Inventory & Root-Cause Localization</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated bug detection, V8 execution traces, and Spectrum-Based Fault Localization (Ochiai)
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
          <Flame className="h-4 w-4 text-amber-400" />
          <span>Top-1 SBFL Accuracy: <strong className="text-cyan-400">93.1%</strong></span>
        </div>
      </div>

      {/* Main Grid: Left list of bugs, Right detailed inspection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Bug List (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          {/* Filter Bar */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search defects or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Severity:</span>
              {['ALL', 'critical', 'high', 'medium'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`rounded px-2 py-0.5 capitalize text-[11px] font-medium transition-colors ${
                    severityFilter === sev
                      ? 'bg-rose-500/20 text-rose-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Bug Card List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredBugs.map((bug) => {
              const isSelected = selectedBug?.id === bug.id;

              return (
                <div
                  key={bug.id}
                  onClick={() => setSelectedBugId(bug.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-rose-500/60 bg-gradient-to-r from-rose-950/20 to-slate-900 shadow-md ring-1 ring-rose-500/30'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded font-mono text-[10px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-200 border border-slate-700">
                        {bug.bugKey}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold uppercase ${getSeverityPill(
                          bug.severity
                        )}`}
                      >
                        {bug.severity}
                      </span>
                    </div>
                    <StatusBadge status={bug.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {bug.title}
                  </h4>

                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <div className="flex items-center gap-1 truncate max-w-[190px]">
                      <FileCode className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{bug.targetFile}:{bug.targetLine}</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">
                      {bug.detectionConfidence.toFixed(0)}% conf
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bug Detail & Ochiai SBFL Spectrum (7 cols) */}
        <div className="lg:col-span-7">
          <BugDetailView bug={selectedBug} />
        </div>
      </div>
    </div>
  );
};
