import { AgentConfig, AgentId, AgentLogMessage, AgentStatus, AgentTelemetry } from './agent';

export type PipelineOverallStatus = 'idle' | 'running' | 'passed' | 'failed' | 'needs_review';

export interface PipelineStage extends AgentConfig {
  status: AgentStatus;
  progress: number; // 0 - 100
  currentAction: string;
  telemetry: AgentTelemetry;
  logs: AgentLogMessage[];
  artifactsGenerated: string[];
  findingsCount: number;
}

export interface PipelineRunSummary {
  coveragePct: number;
  mutationScore: number;
  bugsDetected: number;
  patchesSynthesized: number;
  patchesValidated: number;
  testsGenerated: number;
}

export interface PipelineRun {
  id: string;
  runNumber: number;
  repoId: string;
  repoName: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  status: PipelineOverallStatus;
  trigger: 'push' | 'pull_request' | 'manual' | 'scheduled';
  stages: PipelineStage[];
  summary: PipelineRunSummary;
}
