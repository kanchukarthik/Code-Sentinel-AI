import { AgentId } from './agent';

export interface RepositoryConfig {
  id: string;
  name: string;
  url: string;
  defaultBranch: string;
  activeBranch: string;
  language: string;
  isConnected: boolean;
  lastScanAt: string;
  totalFilesAnalyzed: number;
  totalAstNodes: number;
}

export type AutoHealPolicy = 'human_review' | 'auto_approve_high_confidence' | 'autonomous';

export interface SystemSettings {
  activeRepoId: string;
  autoHealPolicy: AutoHealPolicy;
  confidenceThreshold: number; // e.g. 85%
  minValidationThreshold: number; // e.g. 100% test pass
  enabledTestTypes: {
    functional: boolean;
    boundary: boolean;
    negative: boolean;
    regression: boolean;
    exceptionHandling: boolean;
  };
  mutationTestingDepth: 'light' | 'standard' | 'exhaustive';
  agentModels: Record<AgentId, string>;
  maxConcurrentAgents: number;
  notificationChannels: {
    slackWebhook: string;
    discordWebhook: string;
    notifyOnFailureOnly: boolean;
    prCommentOnPatch: boolean;
    emailAlerts: boolean;
  };
}
