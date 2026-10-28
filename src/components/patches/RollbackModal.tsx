import React, { useState } from 'react';
import { CandidatePatch } from '../../types/patchReview';
import { Modal } from '../common/Modal';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface RollbackModalProps {
  patch: CandidatePatch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRollback: (patchId: string, reason: string) => void;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  patch,
  isOpen,
  onClose,
  onConfirmRollback,
}) => {
  const [reason, setReason] = useState<string>('Unexpected edge case in staging integration');

  if (!patch) return null;

  const handleConfirm = () => {
    onConfirmRollback(patch.id, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Autonomous Patch Rollback"
      subtitle={`Reverting ${patch.patchKey} on ${patch.targetFile}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs font-sans">
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 flex items-start gap-2.5 text-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block">
              Warning: Reverting Applied Program Patch
            </span>
            <span>
              This will create an inverse Git revert commit on the active branch, restore original AST definitions, and re-run validation.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Rollback Rationale / Reason:
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            placeholder="Explain reason for rollback (e.g., unintended latency regression, false positive)..."
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-950 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Confirm Revert & Rollback</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
