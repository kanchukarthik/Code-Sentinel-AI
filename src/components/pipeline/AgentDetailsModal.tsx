import React from 'react';
import { PipelineStage } from '../../types/pipeline';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import {
  Cpu,
  Clock,
  Sparkles,
  HardDrive,
  FileCode,
  Terminal,
  Layers,
  Code2,
} from 'lucide-react';

interface AgentDetailsModalProps {
  stage: PipelineStage | null;
  onClose: () => void;
}

export const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({ stage, onClose }) => {
  if (!stage) return null;

  return (
    <Modal
      isOpen={!!stage}
      onClose={onClose}
      title={`${stage.name} (Stage 0${stage.order})`}
      subtitle={stage.shortRole}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top summary row: Status, Model, Telemetry */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-500 block mb-1">State:</span>
            <StatusBadge status={stage.status} size="md" />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-500 block mb-1">Assigned Model:</span>
            <span className="font-semibold text-cyan-400">{stage.model}</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-500 block mb-1">Execution Time:</span>
            <span className="font-semibold text-white">
              {(stage.telemetry.executionTimeMs / 1000).toFixed(2)}s
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-500 block mb-1">Token Consumption:</span>
            <span className="font-semibold text-purple-400">
              {stage.telemetry.tokensUsed.toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* Agent Description & Mission */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            Agent Mission & Cognitive Scope
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {stage.description}
          </p>
        </div>

        {/* Artifacts Generated */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
            <FileCode className="h-3.5 w-3.5 text-emerald-400" />
            Generated Intermediate Artifacts ({stage.artifactsGenerated.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {stage.artifactsGenerated.map((artifact, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900 px-2.5 py-1 text-xs font-mono text-slate-300"
              >
                <Code2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{artifact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Cognitive Prompt Template Snippet */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            LLM Orchestration Context & Instruction Prompt
          </h4>
          <pre className="rounded-lg bg-black/80 border border-slate-800/80 p-3 overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
{`SYSTEM: You are the ${stage.name} in the CodeSentinel framework.
Role: ${stage.shortRole}.
Temperature: ${stage.temperature}.
Context window: Target repository AST & branch graph loaded.
Task: Execute programmatic analysis and emit structured JSON telemetry.`}
          </pre>
        </div>

        {/* Stage Specific Logs */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            Agent Execution Trace ({stage.logs.length} events)
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg bg-black/80 border border-slate-800/80 p-3">
            {stage.logs.map((log) => (
              <div key={log.id} className="text-[11px] text-slate-300">
                <span className="text-slate-500 mr-2">{log.timestamp}</span>
                <span className="text-cyan-400 mr-2">[{log.level}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
