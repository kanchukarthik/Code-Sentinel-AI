import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { MetricCard } from '../common/MetricCard';
import { ShieldCheck, Dna, Bug, Sparkles, Zap, Flame } from 'lucide-react';

export const MetricSummaryGrid: React.FC = () => {
  const { activeRun, detectedBugs, candidatePatches, synthesizedTests } = usePipeline();

  const openBugs = detectedBugs.filter((b) => b.status === 'open' || b.status === 'patch-ready').length;
  const validatedPatches = candidatePatches.filter((p) => p.status === 'approved' || p.validation.verdict === 'verified').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* 1. Statement & Branch Coverage */}
      <MetricCard
        title="Code Coverage"
        value={activeRun.summary.coveragePct.toFixed(1)}
        unit="%"
        delta={{ value: +3.6, isPositiveGood: true, period: 'vs run #141' }}
        description="Branch: 82.4% (+4.1%)"
        icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
        highlight
      />

      {/* 2. Mutation Score */}
      <MetricCard
        title="Mutation Score"
        value={activeRun.summary.mutationScore.toFixed(1)}
        unit="%"
        delta={{ value: +3.6, isPositiveGood: true, period: 'killed mutants' }}
        description="42/44 mutants killed"
        icon={<Dna className="h-4 w-4 text-purple-400" />}
      />

      {/* 3. Open Defects */}
      <MetricCard
        title="Open Bugs Detected"
        value={openBugs}
        delta={{ value: -1, isPositiveGood: false, period: 'resolved' }}
        description="1 Critical, 1 High Severity"
        icon={<Bug className="h-4 w-4 text-rose-400" />}
      />

      {/* 4. Patch Success Rate */}
      <MetricCard
        title="Patch Success Rate"
        value="93.3"
        unit="%"
        delta={{ value: +4.4, isPositiveGood: true, period: 'acceptance' }}
        description={`${validatedPatches} patches verified`}
        icon={<Sparkles className="h-4 w-4 text-cyan-400" />}
      />

      {/* 5. Autonomous Test Generation */}
      <MetricCard
        title="Synthesized Tests"
        value={synthesizedTests.length}
        unit="tests"
        delta={{ value: +6, isPositiveGood: true, period: 'new paths' }}
        description="100% pass, 0 regressions"
        icon={<Zap className="h-4 w-4 text-amber-400" />}
      />
    </div>
  );
};
