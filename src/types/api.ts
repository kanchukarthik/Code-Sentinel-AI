import { AgentId, AgentLogMessage, AgentStatus, AgentTelemetry } from './agent';
import { PipelineOverallStatus, PipelineRun } from './pipeline';
import { SynthesizedTest } from './testSynthesis';
import { DetectedBug } from './bugDetection';
import { CandidatePatch, PatchStatus } from './patchReview';
import { EvaluationMetricTrend } from './metrics';

/**
 * WebSocket incoming event contracts from CodeSentinel backend orchestrator
 */
export type WebSocketEventType =
  | 'PIPELINE_INIT'
  | 'AGENT_STATUS_CHANGED'
  | 'AGENT_PROGRESS'
  | 'AGENT_LOG'
  | 'TEST_SYNTHESIZED'
  | 'BUG_DETECTED'
  | 'PATCH_GENERATED'
  | 'VALIDATION_COMPLETED'
  | 'PIPELINE_FINISHED';

export interface BaseSocketMessage<T extends WebSocketEventType, P> {
  event: T;
  timestamp: string;
  runId: string;
  payload: P;
}

export type PipelineInitMessage = BaseSocketMessage<
  'PIPELINE_INIT',
  { run: PipelineRun }
>;

export type AgentStatusChangedMessage = BaseSocketMessage<
  'AGENT_STATUS_CHANGED',
  { agentId: AgentId; status: AgentStatus; action: string; telemetry?: Partial<AgentTelemetry> }
>;

export type AgentProgressMessage = BaseSocketMessage<
  'AGENT_PROGRESS',
  { agentId: AgentId; progress: number; currentAction: string }
>;

export type AgentLogMessageEvent = BaseSocketMessage<
  'AGENT_LOG',
  { log: AgentLogMessage }
>;

export type TestSynthesizedMessage = BaseSocketMessage<
  'TEST_SYNTHESIZED',
  { test: SynthesizedTest }
>;

export type BugDetectedMessage = BaseSocketMessage<
  'BUG_DETECTED',
  { bug: DetectedBug }
>;

export type PatchGeneratedMessage = BaseSocketMessage<
  'PATCH_GENERATED',
  { patch: CandidatePatch }
>;

export type PipelineFinishedMessage = BaseSocketMessage<
  'PIPELINE_FINISHED',
  { status: PipelineOverallStatus; completedAt: string; durationSeconds: number }
>;

export type PipelineWebSocketMessage =
  | PipelineInitMessage
  | AgentStatusChangedMessage
  | AgentProgressMessage
  | AgentLogMessageEvent
  | TestSynthesizedMessage
  | BugDetectedMessage
  | PatchGeneratedMessage
  | PipelineFinishedMessage;

/**
 * REST API client request / response contracts
 */
export interface TriggerRunRequest {
  repoId: string;
  branch: string;
  commitHash?: string;
  testCategories?: string[];
  autoHealEnabled?: boolean;
}

export interface TriggerRunResponse {
  runId: string;
  status: 'queued' | 'started';
  pipelineUrl: string;
}

export interface PatchActionRequest {
  patchId: string;
  action: 'approve' | 'reject' | 'rollback';
  notes?: string;
  rollbackReason?: string;
}

export interface PatchActionResponse {
  patchId: string;
  newStatus: PatchStatus;
  updatedAt: string;
  gitCommitSha?: string;
}

export interface DashboardOverviewResponse {
  activeRun: PipelineRun | null;
  recentRuns: PipelineRun[];
  metricsTrend: EvaluationMetricTrend[];
  openBugsCount: number;
  pendingPatchesCount: number;
}
