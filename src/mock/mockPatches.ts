import { CandidatePatch } from '../types/patchReview';

export const MOCK_CANDIDATE_PATCHES: CandidatePatch[] = [
  {
    id: 'patch-1',
    patchKey: 'PATCH-801',
    bugId: 'bug-1',
    bugTitle: 'Precision truncation & roundoff error in fractional transaction reconciliation',
    targetFile: 'src/payment/ledger_reconciler.ts',
    targetFunction: 'reconcileTransactionBatch',
    strategy: 'Arbitrary-Precision BigNumber Integer Scaling',
    createdAt: '2026-09-15 10:42:30',
    status: 'candidate',
    confidenceScore: 98.2,
    authorAgent: 'Self-Healing / Repair Agent (DeepSeek-Coder-V2)',
    explanation: 'Replaced native IEEE-754 floating point subtraction with scaled integer BigInt operations (fixed 18-decimal scaling). This eliminates binary fractional precision drift while maintaining microsecond performance.',
    diff: {
      oldPath: 'src/payment/ledger_reconciler.ts',
      newPath: 'src/payment/ledger_reconciler.ts',
      additions: 11,
      deletions: 4,
      hunks: [
        {
          oldStart: 136,
          oldLines: 13,
          newStart: 136,
          newLines: 20,
          header: '@@ -136,13 +136,20 @@ export class LedgerReconciler {',
          lines: [
            { type: 'normal', content: '  public async reconcileTransactionBatch(batch: TransactionEntry[]): Promise<ReconcileResult> {', oldLineNumber: 136, newLineNumber: 136 },
            { type: 'normal', content: '    const startTime = performance.now();', oldLineNumber: 137, newLineNumber: 137 },
            { type: 'del', content: '    let totalDelta = 0;', oldLineNumber: 138 },
            { type: 'add', content: '    // Use scaled BigInt (1e18) to avoid IEEE-754 float epsilon drift', newLineNumber: 138 },
            { type: 'add', content: '    const SCALE = 1000000000000000000n;', newLineNumber: 139 },
            { type: 'add', content: '    let totalDeltaScaled = 0n;', newLineNumber: 140 },
            { type: 'normal', content: '', oldLineNumber: 139, newLineNumber: 141 },
            { type: 'normal', content: '    for (const item of batch) {', oldLineNumber: 140, newLineNumber: 142 },
            { type: 'del', content: '      totalDelta = totalDelta - parseFloat(item.delta);', oldLineNumber: 141 },
            { type: 'del', content: '      if (Math.abs(totalDelta) > Number.EPSILON) {', oldLineNumber: 142 },
            { type: 'del', content: '        this.metrics.recordVariance(totalDelta);', oldLineNumber: 143 },
            { type: 'add', content: '      const parsedScaled = parseToScaledBigInt(item.delta, SCALE);', newLineNumber: 143 },
            { type: 'add', content: '      totalDeltaScaled = totalDeltaScaled - parsedScaled;', newLineNumber: 144 },
            { type: 'add', content: '      if (totalDeltaScaled !== 0n) {', newLineNumber: 145 },
            { type: 'add', content: '        this.metrics.recordVariance(Number(totalDeltaScaled) / Number(SCALE));', newLineNumber: 146 },
            { type: 'normal', content: '      }', oldLineNumber: 144, newLineNumber: 147 },
            { type: 'normal', content: '    }', oldLineNumber: 145, newLineNumber: 148 },
            { type: 'add', content: '    const isBalanced = totalDeltaScaled === 0n;', newLineNumber: 149 },
            { type: 'add', content: '    const finalDiscrepancy = Number(totalDeltaScaled) / Number(SCALE);', newLineNumber: 150 },
            { type: 'del', content: '    return { isBalanced: totalDelta === 0, netDiscrepancy: totalDelta };', oldLineNumber: 146 },
            { type: 'add', content: '    return { isBalanced, netDiscrepancy: finalDiscrepancy };', newLineNumber: 151 },
            { type: 'normal', content: '  }', oldLineNumber: 147, newLineNumber: 152 }
          ]
        }
      ]
    },
    validation: {
      baselineTestsPassed: 84,
      baselineTestsTotal: 84,
      synthesizedTestsPassed: 14,
      synthesizedTestsTotal: 14,
      regressionsIntroduced: 0,
      mutationScoreDeltaPct: +5.4,
      falsePositiveRiskScore: 0.02,
      falsePositiveLabel: 'low',
      executionTimeDeltaMs: -1.2,
      verdict: 'verified',
      verifierNotes: 'Verified against all 98 tests. Zero regressions. Mutation test killed 42/44 surviving mutants in target method.'
    }
  },
  {
    id: 'patch-2',
    patchKey: 'PATCH-802',
    bugId: 'bug-2',
    bugTitle: 'Deadlock & timeout in distributed Redis lock under high concurrency contention',
    targetFile: 'src/cache/redis_session_store.ts',
    targetFunction: 'acquireLockWithTimeout',
    strategy: 'Exponential Backoff with Full Jitter + TTL Heartbeat',
    createdAt: '2026-09-15 10:42:32',
    status: 'candidate',
    confidenceScore: 94.1,
    authorAgent: 'Self-Healing / Repair Agent (Claude 3.7 Sonnet)',
    explanation: 'Introduces decorrelated jitter to spin-wait intervals, preventing thundering herd behavior when Redis locks are released under high worker concurrency.',
    diff: {
      oldPath: 'src/cache/redis_session_store.ts',
      newPath: 'src/cache/redis_session_store.ts',
      additions: 9,
      deletions: 2,
      hunks: [
        {
          oldStart: 62,
          oldLines: 10,
          newStart: 62,
          newLines: 17,
          header: '@@ -62,10 +62,17 @@ export class RedisSessionStore {',
          lines: [
            { type: 'normal', content: '    let attempt = 0;', oldLineNumber: 62, newLineNumber: 62 },
            { type: 'normal', content: '    while (Date.now() - startTime < timeoutMs) {', oldLineNumber: 63, newLineNumber: 63 },
            { type: 'normal', content: '      const acquired = await this.redis.set(lockKey, token, "NX", "PX", ttlMs);', oldLineNumber: 64, newLineNumber: 64 },
            { type: 'normal', content: '      if (acquired === "OK") return token;', oldLineNumber: 65, newLineNumber: 65 },
            { type: 'del', content: '      // Fixed sleep causes resonance and thundering herd', oldLineNumber: 66 },
            { type: 'del', content: '      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));', oldLineNumber: 67 },
            { type: 'add', content: '      // Exponential backoff with full jitter to break concurrency resonance', newLineNumber: 66 },
            { type: 'add', content: '      attempt++;', newLineNumber: 67 },
            { type: 'add', content: '      const backoffCap = Math.min(500, RETRY_INTERVAL_MS * Math.pow(1.5, attempt));', newLineNumber: 68 },
            { type: 'add', content: '      const jitteredDelay = Math.floor(Math.random() * backoffCap);', newLineNumber: 69 },
            { type: 'add', content: '      await new Promise((resolve) => setTimeout(resolve, jitteredDelay));', newLineNumber: 70 },
            { type: 'normal', content: '    }', oldLineNumber: 68, newLineNumber: 71 },
            { type: 'normal', content: '    throw new TimeoutError(`Failed to acquire lock for ${lockKey}`);', oldLineNumber: 69, newLineNumber: 72 }
          ]
        }
      ]
    },
    validation: {
      baselineTestsPassed: 84,
      baselineTestsTotal: 84,
      synthesizedTestsPassed: 14,
      synthesizedTestsTotal: 14,
      regressionsIntroduced: 0,
      mutationScoreDeltaPct: +3.8,
      falsePositiveRiskScore: 0.04,
      falsePositiveLabel: 'low',
      executionTimeDeltaMs: -45.0,
      verdict: 'verified',
      verifierNotes: 'Parallel test suite completed 45ms faster with 0 lock timeouts recorded across 32 virtual threads.'
    }
  },
  {
    id: 'patch-3',
    patchKey: 'PATCH-803',
    bugId: 'bug-3',
    bugTitle: 'Uncaught TypeError: Cannot read property "roles" of undefined on deleted user JWT',
    targetFile: 'src/auth/jwt_validator.ts',
    targetFunction: 'validateTokenWithSkew',
    strategy: 'Safe Optional Chaining & Null Object Fallback Guard',
    createdAt: '2026-09-15 10:42:33',
    status: 'approved',
    confidenceScore: 99.5,
    authorAgent: 'Self-Healing / Repair Agent (GPT-4o)',
    explanation: 'Employs optional chaining `payload.user?.roles?.includes("admin")` with defensive default empty array fallback.',
    diff: {
      oldPath: 'src/auth/jwt_validator.ts',
      newPath: 'src/auth/jwt_validator.ts',
      additions: 4,
      deletions: 2,
      hunks: [
        {
          oldStart: 51,
          oldLines: 8,
          newStart: 51,
          newLines: 10,
          header: '@@ -51,8 +51,10 @@ export class JwtValidator {',
          lines: [
            { type: 'normal', content: '    const payload = this.verifySignature(token);', oldLineNumber: 51, newLineNumber: 51 },
            { type: 'del', content: '    // Crash if token has no nested user claims', oldLineNumber: 52 },
            { type: 'del', content: '    const isSuperAdmin = payload.user.roles.includes("admin");', oldLineNumber: 53 },
            { type: 'add', content: '    // Defensive extraction for service and machine-to-machine tokens', newLineNumber: 52 },
            { type: 'add', content: '    const userRoles = Array.isArray(payload.user?.roles) ? payload.user.roles : [];', newLineNumber: 53 },
            { type: 'add', content: '    const isSuperAdmin = userRoles.includes("admin");', newLineNumber: 54 },
            { type: 'normal', content: '    return { isValid: true, permissions: isSuperAdmin ? ALL : READ };', oldLineNumber: 54, newLineNumber: 55 }
          ]
        }
      ]
    },
    validation: {
      baselineTestsPassed: 84,
      baselineTestsTotal: 84,
      synthesizedTestsPassed: 14,
      synthesizedTestsTotal: 14,
      regressionsIntroduced: 0,
      mutationScoreDeltaPct: +2.1,
      falsePositiveRiskScore: 0.01,
      falsePositiveLabel: 'low',
      executionTimeDeltaMs: 0.0,
      verdict: 'verified',
      verifierNotes: 'Safely handles null, undefined, and non-array payload structures.'
    },
    appliedAt: '2026-09-15 10:44:12'
  }
];
