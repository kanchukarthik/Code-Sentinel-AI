export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';

export type BugCategory =
  | 'null-dereference'
  | 'off-by-one'
  | 'resource-leak'
  | 'type-coercion'
  | 'concurrency-race'
  | 'state-inconsistency'
  | 'unhandled-promise';

export interface FaultLocalizationItem {
  line: number;
  score: number; // 0.0 - 1.0 (Ochiai coefficient)
  code: string;
  isSuspect: boolean;
  rank: number;
}

export interface DetectedBug {
  id: string;
  bugKey: string;
  title: string;
  severity: BugSeverity;
  category: BugCategory;
  targetFile: string;
  targetFunction: string;
  targetLine: number;
  detectionConfidence: number; // 0 - 100
  stackTrace: string;
  executionLogExcerpt: string;
  rootCauseExplanation: string;
  faultLocalizationMethod: string;
  faultLocalizationRanking: FaultLocalizationItem[];
  associatedTestId: string;
  associatedTestName: string;
  status: 'open' | 'investigating' | 'patch-ready' | 'resolved' | 'dismissed';
  firstDetectedAt: string;
}
