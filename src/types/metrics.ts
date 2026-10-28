import { PipelineRun } from './pipeline';

export interface EvaluationMetricTrend {
  runId: string;
  runNumber: number;
  commitShort: string;
  timestamp: string;
  // Primary Evaluation Criteria
  codeCoveragePct: number;
  mutationScore: number;
  defectDetectionRate: number; // Defect detection rate %
  faultLocalizationAccuracy: number; // Top-1 Ochiai SBFL accuracy %
  falsePositiveRate: number; // False positive %
  patchSuccessRate: number; // Patch acceptance / verification %
  executionEfficiencySec: number; // Pipeline wall-clock duration in seconds
  tokensUsedTotal: number;
}

export interface RunComparisonSummary {
  runA: PipelineRun;
  runB: PipelineRun;
  deltas: {
    coverageDelta: number;
    mutationDelta: number;
    defectDelta: number;
    patchesDelta: number;
    durationDeltaSec: number;
    testsDelta: number;
  };
}
