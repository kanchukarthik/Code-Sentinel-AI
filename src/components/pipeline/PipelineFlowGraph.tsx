import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { PipelineStage } from '../../types/pipeline';
import { AgentStageCard } from '../common/AgentStageCard';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface PipelineFlowGraphProps {
  onSelectStage: (stage: PipelineStage) => void;
}

export const PipelineFlowGraph: React.FC<PipelineFlowGraphProps> = ({ onSelectStage }) => {
  const { activeRun } = usePipeline();

  return (
    <div className="space-y-4">
      {/* Visual Workflow Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">
          Cognitive Agent Flow (7 Stages)
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Click any stage to inspect LLM prompts, AST inputs, & artifacts
        </span>
      </div>

      {/* Grid of 7 Stages */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {activeRun.stages.map((stage, idx) => (
          <div key={stage.id} className="relative flex flex-col">
            <AgentStageCard
              stage={stage}
              onInspect={() => onSelectStage(stage)}
              className="h-full"
            />
            {/* Horizontal Connector Arrow (hidden on last item) */}
            {idx < activeRun.stages.length - 1 && (
              <div className="hidden xl:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
