import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { DiffViewer } from '../components/common/DiffViewer';
import { StatusBadge } from '../components/common/StatusBadge';
import { ValidationReportView } from '../components/patches/ValidationReportView';
import { RollbackModal } from '../components/patches/RollbackModal';
import { CandidatePatch } from '../types/patchReview';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCode,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

export const PatchReviewPage: React.FC = () => {
  const {
    candidatePatches,
    approvePatch,
    rejectPatch,
    rollbackPatch,
    activeRollbackPatch,
    setActiveRollbackPatch,
  } = usePipeline();

  const [selectedPatchId, setSelectedPatchId] = useState<string>(
    candidatePatches[0]?.id || ''
  );

  const selectedPatch =
    candidatePatches.find((p) => p.id === selectedPatchId) || candidatePatches[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>Self-Healing & Patch Review Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            AST-guided candidate repairs synthesized by Self-Healing LLMs with dual test verification
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Patch Acceptance Rate: <strong className="text-emerald-400">93.3%</strong></span>
        </div>
      </div>

      {/* Main Grid: Left patch selector, Right diff & verification report */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Patches List (4 cols) */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400 font-mono">
            <span>Candidate Patches ({candidatePatches.length})</span>
            <span className="text-[10px] text-slate-500">Autonomous Synthesis</span>
          </div>

          <div className="space-y-2.5">
            {candidatePatches.map((patch) => {
              const isSelected = selectedPatch?.id === patch.id;

              return (
                <div
                  key={patch.id}
                  onClick={() => setSelectedPatchId(patch.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-950/20 to-slate-900 shadow-lg ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold rounded bg-slate-800 px-2 py-0.5 text-cyan-300 border border-slate-700">
                      {patch.patchKey}
                    </span>
                    <StatusBadge status={patch.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {patch.bugTitle}
                  </h4>

                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1 truncate text-purple-300">
                      <FileCode className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{patch.targetFile}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold">
                      +{patch.diff.additions} / -{patch.diff.deletions} lines
                    </span>
                    <span className="text-slate-400">
                      {patch.confidenceScore}% conf
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Patch Inspection, Actions, Diff & Report (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          {selectedPatch ? (
            <>
              {/* Patch Action & Meta Bar */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-slate-700">
                        {selectedPatch.patchKey}
                      </span>
                      <StatusBadge status={selectedPatch.status} size="md" />
                      <span className="text-xs font-mono text-slate-400">
                        &bull; {selectedPatch.authorAgent}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-white">
                      {selectedPatch.strategy}
                    </h3>
                  </div>

                  {/* Actions: Approve / Reject / Rollback */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {selectedPatch.status === 'candidate' && (
                      <>
                        <button
                          onClick={() => approvePatch(selectedPatch.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve & Merge</span>
                        </button>
                        <button
                          onClick={() => rejectPatch(selectedPatch.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4 text-slate-400" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {selectedPatch.status === 'approved' && (
                      <button
                        onClick={() => setActiveRollbackPatch(selectedPatch)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Rollback Patch</span>
                      </button>
                    )}

                    {selectedPatch.status === 'rolled_back' && (
                      <span className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 font-mono text-xs text-slate-400">
                        Rolled Back: {selectedPatch.rollbackReason || 'Human policy override'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Repair strategy explanation */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-slate-200 block font-mono text-[11px] mb-1">
                    Repair Strategy Rationale:
                  </strong>
                  {selectedPatch.explanation}
                </div>
              </div>

              {/* Validation Agent Dual Verification Report */}
              <ValidationReportView validation={selectedPatch.validation} />

              {/* Interactive Diff Viewer */}
              <DiffViewer
                diff={selectedPatch.diff}
                title={`Diff: ${selectedPatch.targetFile}`}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      <RollbackModal
        patch={activeRollbackPatch}
        isOpen={!!activeRollbackPatch}
        onClose={() => setActiveRollbackPatch(null)}
        onConfirmRollback={(patchId, reason) => rollbackPatch(patchId, reason)}
      />
    </div>
  );
};
