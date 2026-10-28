import { DetectedBug } from '../types/bugDetection';

export const MOCK_DETECTED_BUGS: DetectedBug[] = [
  {
    id: 'bug-1',
    bugKey: 'BUG-401',
    title: 'Precision truncation & roundoff error in fractional transaction reconciliation',
    severity: 'critical',
    category: 'off-by-one',
    targetFile: 'src/payment/ledger_reconciler.ts',
    targetFunction: 'reconcileTransactionBatch',
    targetLine: 142,
    detectionConfidence: 97.4,
    stackTrace: `AssertionError: Expected netDiscrepancy to be 0, but received -0.000000000000001
    at Object.<anonymous> (test/payment/ledger_reconciler.spec.ts:42:26)
    at runTest (node_modules/jest-runner/build/runTest.js:389:10)
    at async TestRunner.runTests (src/runner/sandbox.ts:114:18)
    at async reconcileTransactionBatch (src/payment/ledger_reconciler.ts:142:19)`,
    executionLogExcerpt: `[2026-09-15 10:42:16.890] [WARN] [Sandbox] test_reconciler_sub_satoshi_precision_underflow failed!
[2026-09-15 10:42:16.892] [DEBUG] Input batch size: 2 items, currency: BTC.
[2026-09-15 10:42:16.894] [DEBUG] Accumulator intermediate state: 0.00000001 - 0.000000010000001 = -1e-15.`,
    rootCauseExplanation: `The function performs direct arithmetic subtraction \`totalDelta -= entry.amount\` using standard JavaScript IEEE-754 64-bit floating point numbers. When processing high-precision cryptocurrency transactions with 8 or more decimal places, binary fraction representation limits cause sub-satoshi epsilon drift.

Conditions to trigger:
1. Currency amounts with decimal precision >= 7 digits.
2. Sum of reciprocal balances that cannot be precisely represented in base-2 binary floating point.`,
    faultLocalizationMethod: 'Spectrum-Based Fault Localization (SBFL Ochiai)',
    faultLocalizationRanking: [
      { line: 142, score: 0.948, code: 'totalDelta = totalDelta - parseFloat(item.delta);', isSuspect: true, rank: 1 },
      { line: 143, score: 0.781, code: 'if (Math.abs(totalDelta) > Number.EPSILON) {', isSuspect: true, rank: 2 },
      { line: 140, score: 0.412, code: 'for (const item of batch) {', isSuspect: false, rank: 3 },
      { line: 146, score: 0.220, code: 'return { isBalanced: totalDelta === 0, netDiscrepancy: totalDelta };', isSuspect: false, rank: 4 },
      { line: 138, score: 0.080, code: 'let totalDelta = 0;', isSuspect: false, rank: 5 }
    ],
    associatedTestId: 'test-1',
    associatedTestName: 'test_reconciler_sub_satoshi_precision_underflow',
    status: 'patch-ready',
    firstDetectedAt: '2026-09-15 10:42:16',
  },
  {
    id: 'bug-2',
    bugKey: 'BUG-402',
    title: 'Deadlock & timeout in distributed Redis lock under high concurrency contention',
    severity: 'high',
    category: 'concurrency-race',
    targetFile: 'src/cache/redis_session_store.ts',
    targetFunction: 'acquireLockWithTimeout',
    targetLine: 67,
    detectionConfidence: 91.2,
    stackTrace: `TimeoutError: Lock acquisition timed out after 3000ms for key 'lock:sess_concurrent_99'
    at RedisSessionStore.acquireLockWithTimeout (src/cache/redis_session_store.ts:67:13)
    at async processParallelRequests (src/cache/session_manager.ts:188:9)
    at async Promise.all (index 7)`,
    executionLogExcerpt: `[2026-09-15 10:42:18.115] [WARN] [Sandbox] test_session_store_redis_failover_fallback_to_memory encountered contention spike.
[2026-09-15 10:42:18.118] [DEBUG] 16 concurrent goroutines competing for lock:sess_concurrent_99.
[2026-09-15 10:42:18.120] [DEBUG] Redlock lease renewal failed due to missing TTL heartbeat ticker.`,
    rootCauseExplanation: `When multiple workers contest the same lock during cache invalidation, the retry loop lacks exponential backoff randomization (jitter). All waiting workers wake up simultaneously at 100ms intervals, hammering Redis SETNX and causing starvation of thread #7 until the 3000ms deadline expires.

Conditions to trigger:
1. Concurrency > 8 workers simultaneously attempting to mutate session.
2. Fixed sleep duration in spin-wait loop without randomized jitter.`,
    faultLocalizationMethod: 'Spectrum-Based Fault Localization (SBFL Ochiai)',
    faultLocalizationRanking: [
      { line: 67, score: 0.892, code: 'await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));', isSuspect: true, rank: 1 },
      { line: 64, score: 0.740, code: 'const acquired = await this.redis.set(lockKey, token, "NX", "PX", ttlMs);', isSuspect: true, rank: 2 },
      { line: 70, score: 0.430, code: 'if (Date.now() - startTime > timeoutMs) throw new TimeoutError();', isSuspect: false, rank: 3 },
      { line: 61, score: 0.150, code: 'const startTime = Date.now();', isSuspect: false, rank: 4 }
    ],
    associatedTestId: 'test-3',
    associatedTestName: 'test_session_store_redis_failover_fallback_to_memory',
    status: 'patch-ready',
    firstDetectedAt: '2026-09-15 10:42:18',
  },
  {
    id: 'bug-3',
    bugKey: 'BUG-403',
    title: 'Uncaught TypeError: Cannot read property "roles" of undefined on deleted user JWT',
    severity: 'high',
    category: 'null-dereference',
    targetFile: 'src/auth/jwt_validator.ts',
    targetFunction: 'validateTokenWithSkew',
    targetLine: 54,
    detectionConfidence: 94.6,
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'roles')
    at JwtValidator.validateTokenWithSkew (src/auth/jwt_validator.ts:54:33)
    at authMiddleware (src/middleware/auth.ts:28:15)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)`,
    executionLogExcerpt: `[2026-09-15 10:42:19.012] [ERROR] Unhandled exception in synthetic JWT test fixture.
[2026-09-15 10:42:19.015] [DEBUG] Payload claims decoded: { sub: 'usr_tombstone_404', exp: 1740000000, user: undefined }`,
    rootCauseExplanation: `The JWT payload schema allows service tokens where the nested \`user\` metadata object is omitted. The validator directly accesses \`payload.user.roles\` without optional chaining or null-guards, throwing an uncaught TypeError that crashes request handlers.`,
    faultLocalizationMethod: 'Spectrum-Based Fault Localization (SBFL Ochiai)',
    faultLocalizationRanking: [
      { line: 54, score: 0.910, code: 'const isSuperAdmin = payload.user.roles.includes("admin");', isSuspect: true, rank: 1 },
      { line: 52, score: 0.650, code: 'const payload = this.verifySignature(token);', isSuspect: false, rank: 2 },
      { line: 55, score: 0.310, code: 'return { isValid: true, permissions: isSuperAdmin ? ALL : READ };', isSuspect: false, rank: 3 }
    ],
    associatedTestId: 'test-2',
    associatedTestName: 'test_jwt_expired_token_clock_skew_tolerance',
    status: 'patch-ready',
    firstDetectedAt: '2026-09-15 10:42:19',
  },
  {
    id: 'bug-4',
    bugKey: 'BUG-404',
    title: 'Potential SQL injection risk through unescaped identifier in dynamic ORDER BY',
    severity: 'medium',
    category: 'type-coercion',
    targetFile: 'src/database/query_builder.ts',
    targetFunction: 'buildOrderByClause',
    targetLine: 98,
    detectionConfidence: 86.8,
    stackTrace: `InvalidIdentifierError: Query order clause contains prohibited characters
    at QueryBuilder.buildOrderByClause (src/database/query_builder.ts:98:11)`,
    executionLogExcerpt: `[2026-09-15 10:42:20.100] [WARN] Negative security test detected insecure string interpolation in query builder.`,
    rootCauseExplanation: `Raw string concatenation \`ORDER BY \${column} \${direction}\` permits column names containing semicolons or comment sequences when caller input bypasses validation whitelist.`,
    faultLocalizationMethod: 'Spectrum-Based Fault Localization (SBFL Ochiai)',
    faultLocalizationRanking: [
      { line: 98, score: 0.880, code: 'return `ORDER BY ${column} ${direction}`;', isSuspect: true, rank: 1 },
      { line: 95, score: 0.420, code: 'if (!["ASC", "DESC"].includes(direction)) throw new Error("Invalid dir");', isSuspect: false, rank: 2 }
    ],
    associatedTestId: 'test-5',
    associatedTestName: 'test_sql_builder_prevent_nested_identifier_injection',
    status: 'investigating',
    firstDetectedAt: '2026-09-15 10:42:20',
  }
];
