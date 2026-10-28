export type PatchStatus = 'candidate' | 'approved' | 'rejected' | 'rolled_back';

export interface DiffLine {
  type: 'add' | 'del' | 'normal';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: DiffLine[];
}

export interface FileDiff {
  oldPath: string;
  newPath: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface PatchValidationReport {
  baselineTestsPassed: number;
  baselineTestsTotal: number;
  synthesizedTestsPassed: number;
  synthesizedTestsTotal: number;
  regressionsIntroduced: number;
  mutationScoreDeltaPct: number;
  falsePositiveRiskScore: number; // 0.0 - 1.0
  falsePositiveLabel: 'low' | 'moderate' | 'high';
  executionTimeDeltaMs: number;
  verdict: 'verified' | 'regressed' | 'inconclusive';
  verifierNotes: string;
}

export interface CandidatePatch {
  id: string;
  patchKey: string;
  bugId: string;
  bugTitle: string;
  targetFile: string;
  targetFunction: string;
  strategy: string; // e.g., 'AST Guard Synthesis + Null Check'
  createdAt: string;
  status: PatchStatus;
  confidenceScore: number; // 0 - 100
  diff: FileDiff;
  validation: PatchValidationReport;
  explanation: string;
  authorAgent: string;
  reviewerNotes?: string;
  appliedAt?: string;
  rolledBackAt?: string;
  rollbackReason?: string;
}
