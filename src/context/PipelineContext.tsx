import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AgentId, AgentLogMessage, AgentStatus } from '../types/agent';
import { PipelineRun, PipelineStage } from '../types/pipeline';
import { SynthesizedTest } from '../types/testSynthesis';
import { DetectedBug } from '../types/bugDetection';
import { CandidatePatch, PatchStatus } from '../types/patchReview';
import { EvaluationMetricTrend } from '../types/metrics';
import { RepositoryConfig, SystemSettings } from '../types/settings';
import {
  CURRENT_RUN,
  HISTORICAL_RUNS,
  MOCK_REPOSITORIES,
  DEFAULT_SETTINGS,
  AGENT_CONFIGS,
} from '../mock/initialData';
import { INITIAL_MOCK_LOGS } from '../mock/mockLogs';
import { MOCK_SYNTHESIZED_TESTS } from '../mock/mockTests';
import { MOCK_DETECTED_BUGS } from '../mock/mockBugs';
import { MOCK_CANDIDATE_PATCHES } from '../mock/mockPatches';
import { MOCK_METRIC_TRENDS } from '../mock/mockMetrics';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

interface PipelineContextType {
  repositories: RepositoryConfig[];
  activeRepo: RepositoryConfig;
  setActiveRepoId: (repoId: string) => void;

  activeRun: PipelineRun;
  historicalRuns: PipelineRun[];

  // Simulation controls
  isSimulating: boolean;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  triggerNewRun: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetToDefaultRun: () => void;

  // Logs
  logs: AgentLogMessage[];
  isLogsPaused: boolean;
  setIsLogsPaused: (paused: boolean) => void;
  clearLogs: () => void;

  // Domain data
  synthesizedTests: SynthesizedTest[];
  detectedBugs: DetectedBug[];
  candidatePatches: CandidatePatch[];
  metricTrends: EvaluationMetricTrend[];

  // Actions
  approvePatch: (patchId: string, notes?: string) => void;
  rejectPatch: (patchId: string, reason?: string) => void;
  rollbackPatch: (patchId: string, reason: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Modals & UI selection
  selectedAgentForDetail: PipelineStage | null;
  setSelectedAgentForDetail: (stage: PipelineStage | null) => void;
  activeRollbackPatch: CandidatePatch | null;
  setActiveRollbackPatch: (patch: CandidatePatch | null) => void;

  // Notifications
  notifications: ToastNotification[];
  dismissNotification: (id: string) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repositories] = useState<RepositoryConfig[]>(MOCK_REPOSITORIES);
  const [activeRepoId, setActiveRepoId] = useState<string>('repo-1');

  const [activeRun, setActiveRun] = useState<PipelineRun>(CURRENT_RUN);
  const [historicalRuns, setHistoricalRuns] = useState<PipelineRun[]>(HISTORICAL_RUNS);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(-1);

  const [logs, setLogs] = useState<AgentLogMessage[]>(INITIAL_MOCK_LOGS);
  const [isLogsPaused, setIsLogsPaused] = useState<boolean>(false);

  const [synthesizedTests] = useState<SynthesizedTest[]>(MOCK_SYNTHESIZED_TESTS);
  const [detectedBugs] = useState<DetectedBug[]>(MOCK_DETECTED_BUGS);
  const [candidatePatches, setCandidatePatches] = useState<CandidatePatch[]>(MOCK_CANDIDATE_PATCHES);
  const [metricTrends] = useState<EvaluationMetricTrend[]>(MOCK_METRIC_TRENDS);

  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const [selectedAgentForDetail, setSelectedAgentForDetail] = useState<PipelineStage | null>(null);
  const [activeRollbackPatch, setActiveRollbackPatch] = useState<CandidatePatch | null>(null);

  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const timerRef = useRef<number | null>(null);
  const activeRunRef = useRef(activeRun);
  activeRunRef.current = activeRun;

  const activeRepo = repositories.find((r) => r.id === activeRepoId) || repositories[0];

  const addNotification = useCallback((type: ToastNotification['type'], title: string, message: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Patch lifecycle handlers
  const approvePatch = useCallback((patchId: string, notes?: string) => {
    setCandidatePatches((prev) =>
      prev.map((patch) => {
        if (patch.id === patchId) {
          return {
            ...patch,
            status: 'approved' as PatchStatus,
            appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            reviewerNotes: notes || 'Approved by autonomous policy / human review',
          };
        }
        return patch;
      })
    );
    addNotification('success', 'Patch Approved & Applied', `Patch ${patchId} merged to active branch and committed.`);
  }, [addNotification]);

  const rejectPatch = useCallback((patchId: string, reason?: string) => {
    setCandidatePatches((prev) =>
      prev.map((patch) => {
        if (patch.id === patchId) {
          return {
            ...patch,
            status: 'rejected' as PatchStatus,
            reviewerNotes: reason || 'Rejected during review',
          };
        }
        return patch;
      })
    );
    addNotification('warning', 'Patch Rejected', `Patch ${patchId} rejected. Marked for alternative repair synthesis.`);
  }, [addNotification]);

  const rollbackPatch = useCallback((patchId: string, reason: string) => {
    setCandidatePatches((prev) =>
      prev.map((patch) => {
        if (patch.id === patchId) {
          return {
            ...patch,
            status: 'rolled_back' as PatchStatus,
            rolledBackAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            rollbackReason: reason,
          };
        }
        return patch;
      })
    );
    setActiveRollbackPatch(null);
    addNotification('error', 'Patch Rolled Back', `Patch ${patchId} cleanly reverted. Test baseline restored.`);
  }, [addNotification]);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addNotification('info', 'Settings Updated', 'Autonomous agent configuration updated successfully.');
  }, [addNotification]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Trigger simulated live pipeline run
  const triggerNewRun = useCallback(() => {
    const newRunNumber = activeRun.runNumber + 1;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Reset stages to idle
    const initializedStages: PipelineStage[] = AGENT_CONFIGS.map((agent) => ({
      ...agent,
      status: 'idle' as AgentStatus,
      progress: 0,
      currentAction: 'Awaiting pipeline dispatch...',
      telemetry: {
        executionTimeMs: 0,
        tokensUsed: 0,
        costEstimateUsd: 0,
        model: agent.model,
        memoryMb: 120,
        cpuPct: 5,
      },
      logs: [],
      artifactsGenerated: [],
      findingsCount: 0,
    }));

    const freshRun: PipelineRun = {
      id: `run-${newRunNumber}`,
      runNumber: newRunNumber,
      repoId: activeRepo.id,
      repoName: activeRepo.name,
      branch: activeRepo.activeBranch,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: 'feat(autonomous): test synthesis & fault localization trigger',
      author: 'karthik@codesentinel.ai',
      startedAt: nowStr,
      durationSeconds: 0,
      status: 'running',
      trigger: 'manual',
      stages: initializedStages,
      summary: {
        coveragePct: 76.5,
        mutationScore: 71.0,
        bugsDetected: 0,
        patchesSynthesized: 0,
        patchesValidated: 0,
        testsGenerated: 0,
      },
    };

    setActiveRun(freshRun);
    setLogs([]);
    setCurrentStageIdx(0);
    setIsSimulating(true);

    addNotification('info', 'Pipeline Dispatched', `Run #${newRunNumber} started on branch ${activeRepo.activeBranch}.`);
  }, [activeRun.runNumber, activeRepo, addNotification]);

  const pauseSimulation = useCallback(() => {
    setIsSimulating(false);
  }, []);

  const resumeSimulation = useCallback(() => {
    if (currentStageIdx >= 0 && currentStageIdx < 7) {
      setIsSimulating(true);
    }
  }, [currentStageIdx]);

  const resetToDefaultRun = useCallback(() => {
    setIsSimulating(false);
    setCurrentStageIdx(-1);
    setActiveRun(CURRENT_RUN);
    setLogs(INITIAL_MOCK_LOGS);
    addNotification('info', 'Reset Complete', 'Restored to baseline demo run #142.');
  }, [addNotification]);

  // Expose run trigger globally and support ?run=true query parameter
  useEffect(() => {
    (window as any).__CODESENTINEL_RUN_PIPELINE__ = triggerNewRun;
    if (typeof window !== 'undefined' && (window.location.search.includes('run=true') || window.location.search.includes('autorun=true'))) {
      triggerNewRun();
    }
  }, [triggerNewRun]);

  // Simulation tick loop
  useEffect(() => {
    if (!isSimulating || currentStageIdx < 0) return;

    if (currentStageIdx >= 7) {
      // Finished all 7 stages
      const completedRun: PipelineRun = {
        ...activeRunRef.current,
        status: 'passed',
        completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        durationSeconds: 124,
        summary: {
          coveragePct: 89.4,
          mutationScore: 85.1,
          bugsDetected: 2,
          patchesSynthesized: 2,
          patchesValidated: 2,
          testsGenerated: 14,
        },
      };
      activeRunRef.current = completedRun;
      setIsSimulating(false);
      setActiveRun(completedRun);
      setHistoricalRuns((prev) => [completedRun, ...prev]);
      addNotification('success', 'Pipeline Completed Successfully', 'All 7 cognitive agents finished their execution cycles.');
      return;
    }

    const currentAgent = AGENT_CONFIGS[currentStageIdx];
    const timePerStage = Math.max(700, 3000 / simulationSpeed);

    // Mark current stage as running
    setActiveRun((prev) => {
      const updatedStages = [...prev.stages];
      if (updatedStages[currentStageIdx]) {
        updatedStages[currentStageIdx] = {
          ...updatedStages[currentStageIdx],
          status: 'running',
          progress: 35,
          currentAction: `Active: Running ${currentAgent.shortRole}...`,
          telemetry: {
            ...updatedStages[currentStageIdx].telemetry,
            memoryMb: Math.floor(250 + Math.random() * 200),
            cpuPct: Math.floor(40 + Math.random() * 50),
          },
        };
      }
      return { ...prev, stages: updatedStages, status: 'running' };
    });

    // Add log entry
    const timeNow = new Date().toISOString().substring(11, 23);
    const newLog: AgentLogMessage = {
      id: `log-sim-${Date.now()}-${currentStageIdx}`,
      timestamp: timeNow,
      level: 'AGENT',
      agentId: currentAgent.id,
      message: `[${currentAgent.name}] In progress: Executing cognitive pass for ${currentAgent.shortRole}...`,
    };
    setLogs((prev) => [...prev, newLog]);

    timerRef.current = window.setTimeout(() => {
      // Complete stage
      setActiveRun((prev) => {
        const updatedStages = [...prev.stages];
        if (updatedStages[currentStageIdx]) {
          const originalStage = CURRENT_RUN.stages[currentStageIdx];
          updatedStages[currentStageIdx] = {
            ...updatedStages[currentStageIdx],
            status: 'passed',
            progress: 100,
            currentAction: originalStage.currentAction,
            telemetry: {
              ...originalStage.telemetry,
              executionTimeMs: Math.floor(originalStage.telemetry.executionTimeMs / simulationSpeed),
            },
            artifactsGenerated: originalStage.artifactsGenerated,
            findingsCount: originalStage.findingsCount,
          };
        }
        return { ...prev, stages: updatedStages };
      });

      // Add completion log
      const doneLog: AgentLogMessage = {
        id: `log-sim-done-${Date.now()}-${currentStageIdx}`,
        timestamp: new Date().toISOString().substring(11, 23),
        level: 'INFO',
        agentId: currentAgent.id,
        message: `[${currentAgent.name}] Stage completed successfully. Produced artifacts and telemetry.`,
      };
      setLogs((prev) => [...prev, doneLog]);

      // Move to next stage
      setCurrentStageIdx((idx) => idx + 1);
    }, timePerStage);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isSimulating, currentStageIdx, simulationSpeed, addNotification]);

  return (
    <PipelineContext.Provider
      value={{
        repositories,
        activeRepo,
        setActiveRepoId,
        activeRun,
        historicalRuns,
        isSimulating,
        simulationSpeed,
        setSimulationSpeed,
        triggerNewRun,
        pauseSimulation,
        resumeSimulation,
        resetToDefaultRun,
        logs,
        isLogsPaused,
        setIsLogsPaused,
        clearLogs,
        synthesizedTests,
        detectedBugs,
        candidatePatches,
        metricTrends,
        approvePatch,
        rejectPatch,
        rollbackPatch,
        settings,
        updateSettings,
        selectedAgentForDetail,
        setSelectedAgentForDetail,
        activeRollbackPatch,
        setActiveRollbackPatch,
        notifications,
        dismissNotification,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = (): PipelineContextType => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
