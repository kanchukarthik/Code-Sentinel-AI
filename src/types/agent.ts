export type AgentId =
  | 'code-intelligence'
  | 'test-synthesis'
  | 'execution'
  | 'bug-detection'
  | 'root-cause'
  | 'self-healing'
  | 'validation';

export type AgentStatus = 'idle' | 'running' | 'passed' | 'failed' | 'warning';

export type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'AGENT';

export interface AgentTelemetry {
  executionTimeMs: number;
  tokensUsed: number;
  costEstimateUsd: number;
  model: string;
  memoryMb: number;
  cpuPct: number;
}

export interface AgentLogMessage {
  id: string;
  timestamp: string;
  level: LogLevel;
  agentId: AgentId;
  message: string;
  payload?: Record<string, unknown>;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  order: number;
  shortRole: string;
  description: string;
  model: string;
  temperature: number;
  enabled: boolean;
}
