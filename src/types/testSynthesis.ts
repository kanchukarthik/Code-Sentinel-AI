export type TestCategory =
  | 'functional'
  | 'boundary'
  | 'negative'
  | 'regression'
  | 'exception-handling';

export type TestStatus = 'passed' | 'failed' | 'flaky';

export interface SynthesizedTest {
  id: string;
  testKey: string;
  name: string;
  category: TestCategory;
  targetFile: string;
  targetFunction: string;
  targetLineRange: [number, number];
  status: TestStatus;
  executionTimeMs: number;
  unexploredPathCoverage: string;
  codeSnippet: string;
  agentRationale: string;
  assertionsCount: number;
  mutationImpactPct: number;
  createdAt: string;
}
