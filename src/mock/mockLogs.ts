import { AgentLogMessage } from '../types/agent';

export const INITIAL_MOCK_LOGS: AgentLogMessage[] = [
  // Code Intelligence Agent
  {
    id: 'log-1',
    timestamp: '10:42:01.104',
    level: 'INFO',
    agentId: 'code-intelligence',
    message: '[CodeIntel] Ingesting repository AST: 142 source files, 38,490 AST nodes parsed via tree-sitter-typescript.',
  },
  {
    id: 'log-2',
    timestamp: '10:42:02.320',
    level: 'DEBUG',
    agentId: 'code-intelligence',
    message: '[CodeIntel] Computed cyclomatic complexity matrix: 18 functions exhibit CC > 12 (Targeting for dense test synthesis).',
  },
  {
    id: 'log-3',
    timestamp: '10:42:03.881',
    level: 'AGENT',
    agentId: 'code-intelligence',
    message: '[CodeIntel] Dependency graph resolved: Identified 3 core hotspots in auth/jwt_validator.ts and payment/ledger_reconciler.ts.',
  },
  {
    id: 'log-4',
    timestamp: '10:42:04.912',
    level: 'INFO',
    agentId: 'code-intelligence',
    message: '[CodeIntel] Baseline test suite mapped: 84 existing unit tests covering 68.4% statement, 59.1% branch coverage.',
  },

  // Test Synthesis Agent
  {
    id: 'log-5',
    timestamp: '10:42:06.155',
    level: 'INFO',
    agentId: 'test-synthesis',
    message: '[TestSynth] Prompting Claude 3.7 Sonnet with AST path constraint: targeting unvisited branch #4 in ledger_reconciler.ts:L88.',
  },
  {
    id: 'log-6',
    timestamp: '10:42:07.820',
    level: 'AGENT',
    agentId: 'test-synthesis',
    message: '[TestSynth] Synthesized boundary test case: `test_reconciler_floating_point_precision_overflow` (Input: 0.00000001 BTC).',
  },
  {
    id: 'log-7',
    timestamp: '10:42:09.301',
    level: 'AGENT',
    agentId: 'test-synthesis',
    message: '[TestSynth] Synthesized exception test case: `test_jwt_expired_with_skew_drift` for auth/jwt_validator.ts.',
  },
  {
    id: 'log-8',
    timestamp: '10:42:11.004',
    level: 'INFO',
    agentId: 'test-synthesis',
    message: '[TestSynth] 14 new test cases generated across 5 categories: [4 Functional, 3 Boundary, 3 Negative, 2 Regression, 2 Exception].',
  },

  // Execution Agent
  {
    id: 'log-9',
    timestamp: '10:42:12.441',
    level: 'INFO',
    agentId: 'execution',
    message: '[Execution] Bootstrapping isolated V8 sandbox worker pool (4 parallel test runners).',
  },
  {
    id: 'log-10',
    timestamp: '10:42:14.218',
    level: 'DEBUG',
    agentId: 'execution',
    message: '[Execution] Running 98 total tests (84 baseline + 14 synthesized) with V8 code coverage profiling.',
  },
  {
    id: 'log-11',
    timestamp: '10:42:16.890',
    level: 'WARN',
    agentId: 'execution',
    message: '[Execution] Test failure detected: `test_reconciler_floating_point_precision_overflow` threw UnhandledRejection: NaN discrepancy.',
  },
  {
    id: 'log-12',
    timestamp: '10:42:18.115',
    level: 'WARN',
    agentId: 'execution',
    message: '[Execution] Test failure detected: `test_session_cache_concurrency_race` threw AssertionError: Lock acquisition timeout.',
  },

  // Bug Detection Agent
  {
    id: 'log-13',
    timestamp: '10:42:19.450',
    level: 'INFO',
    agentId: 'bug-detection',
    message: '[BugDetect] Parsing execution traces, call stacks, and V8 memory profiles.',
  },
  {
    id: 'log-14',
    timestamp: '10:42:20.980',
    level: 'ERROR',
    agentId: 'bug-detection',
    message: '[BugDetect] CRITICAL DEFECT CONFIRMED: Ledger precision truncation in `payment/ledger_reconciler.ts:142` (IEEE-754 roundoff).',
  },
  {
    id: 'log-15',
    timestamp: '10:42:22.010',
    level: 'WARN',
    agentId: 'bug-detection',
    message: '[BugDetect] HIGH DEFECT CONFIRMED: Distributed lock race condition in `cache/redis_session_store.ts:67` under parallel workers.',
  },

  // Root-Cause Analysis Agent
  {
    id: 'log-16',
    timestamp: '10:42:23.512',
    level: 'INFO',
    agentId: 'root-cause',
    message: '[RootCause] Computing Spectrum-Based Fault Localization (SBFL) with Ochiai formulation: S_Ochiai(s) = n_cf / sqrt(n_f * (n_cf + n_cs)).',
  },
  {
    id: 'log-17',
    timestamp: '10:42:25.104',
    level: 'AGENT',
    agentId: 'root-cause',
    message: '[RootCause] Fault Localization Top-1 Hit: `ledger_reconciler.ts:142` suspiciousness score = 0.948 (Rank #1).',
  },
  {
    id: 'log-18',
    timestamp: '10:42:26.490',
    level: 'AGENT',
    agentId: 'root-cause',
    message: '[RootCause] Diagnosis: Direct arithmetic multiplication without BigNumber integer scaling causes cumulative penny loss on fractional currency.',
  },

  // Self-Healing / Repair Agent
  {
    id: 'log-19',
    timestamp: '10:42:27.910',
    level: 'INFO',
    agentId: 'self-healing',
    message: '[SelfHealing] Synthesizing repair patch via DeepSeek-Coder & AST guidance with 3 candidate beam search.',
  },
  {
    id: 'log-20',
    timestamp: '10:42:29.880',
    level: 'AGENT',
    agentId: 'self-healing',
    message: '[SelfHealing] Candidate Patch #P-1042 generated: Replaces raw number product with `Decimal.mul()` safe arbitrary precision arithmetic.',
  },

  // Validation Agent
  {
    id: 'log-21',
    timestamp: '10:42:31.220',
    level: 'INFO',
    agentId: 'validation',
    message: '[Validation] Executing dual verification loop: Running 84 baseline + 14 synthesized tests against candidate patch #P-1042.',
  },
  {
    id: 'log-22',
    timestamp: '10:42:33.805',
    level: 'INFO',
    agentId: 'validation',
    message: '[Validation] 98/98 tests passed. Zero regressions detected. Mutation testing killed 42/44 surviving mutants in target method.',
  },
  {
    id: 'log-23',
    timestamp: '10:42:34.900',
    level: 'AGENT',
    agentId: 'validation',
    message: '[Validation] Patch #P-1042 verified with False Positive Risk = 0.02 (Low). Ready for human review or auto-approval.',
  },
];
