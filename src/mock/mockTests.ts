import { SynthesizedTest } from '../types/testSynthesis';

export const MOCK_SYNTHESIZED_TESTS: SynthesizedTest[] = [
  {
    id: 'test-1',
    testKey: 'ST-201',
    name: 'test_reconciler_sub_satoshi_precision_underflow',
    category: 'boundary',
    targetFile: 'src/payment/ledger_reconciler.ts',
    targetFunction: 'reconcileTransactionBatch',
    targetLineRange: [138, 156],
    status: 'passed',
    executionTimeMs: 142,
    unexploredPathCoverage: 'Branch #4 (fractional balance < 1e-8)',
    codeSnippet: `it('should accurately reconcile sub-satoshi fractional balance underflow', async () => {
  const ledger = new LedgerReconciler({ precision: 8 });
  const inputs = [
    { accountId: 'acc_01', delta: '0.00000001', currency: 'BTC' },
    { accountId: 'acc_02', delta: '-0.00000001', currency: 'BTC' }
  ];
  const result = await ledger.reconcileTransactionBatch(inputs);
  expect(result.isBalanced).toBe(true);
  expect(result.netDiscrepancy.toString()).toBe('0');
});`,
    agentRationale: 'The Code Intelligence Agent identified that existing tests only exercised integer transactions, leaving IEEE-754 epsilon boundary paths vulnerable to compounding drift.',
    assertionsCount: 2,
    mutationImpactPct: 6.8,
    createdAt: '2026-09-15 10:42:07',
  },
  {
    id: 'test-2',
    testKey: 'ST-202',
    name: 'test_jwt_expired_token_clock_skew_tolerance',
    category: 'boundary',
    targetFile: 'src/auth/jwt_validator.ts',
    targetFunction: 'validateTokenWithSkew',
    targetLineRange: [42, 68],
    status: 'passed',
    executionTimeMs: 88,
    unexploredPathCoverage: 'Branch #2 (exp <= now && exp + skewSec > now)',
    codeSnippet: `it('should accept token within 5s clock skew grace window and reject beyond', () => {
  const validator = new JwtValidator({ maxClockSkewSec: 5 });
  const now = Math.floor(Date.now() / 1000);
  const validSkewToken = forgeToken({ exp: now - 3 });
  const expiredSkewToken = forgeToken({ exp: now - 7 });

  expect(validator.validate(validSkewToken).isValid).toBe(true);
  expect(() => validator.validate(expiredSkewToken)).toThrow(TokenExpiredError);
});`,
    agentRationale: 'Synthesized to stress clock skew edge conditions around token expiry, which previously lacked validation at exact ±5s intervals.',
    assertionsCount: 2,
    mutationImpactPct: 4.5,
    createdAt: '2026-09-15 10:42:08',
  },
  {
    id: 'test-3',
    testKey: 'ST-203',
    name: 'test_session_store_redis_failover_fallback_to_memory',
    category: 'negative',
    targetFile: 'src/cache/redis_session_store.ts',
    targetFunction: 'acquireLockWithTimeout',
    targetLineRange: [54, 82],
    status: 'passed',
    executionTimeMs: 230,
    unexploredPathCoverage: 'Catch block (RedisConnectionRefusedError -> LocalFallback)',
    codeSnippet: `it('should gracefully degrade to local lru cache when redis master emits ETIMEDOUT', async () => {
  const store = new RedisSessionStore({ fallbackToLocal: true });
  mockRedis.simulateNetworkPartition();

  const session = await store.getSession('sess_volatile_99');
  expect(session).toBeDefined();
  expect(store.metrics.fallbackEvents).toBe(1);
});`,
    agentRationale: 'Existing tests mocked Redis as permanently healthy. This test synthesizes network dropouts to verify degraded operational mode.',
    assertionsCount: 2,
    mutationImpactPct: 5.2,
    createdAt: '2026-09-15 10:42:09',
  },
  {
    id: 'test-4',
    testKey: 'ST-204',
    name: 'test_rate_limiter_sliding_window_burst_rejection',
    category: 'functional',
    targetFile: 'src/security/rate_limiter.ts',
    targetFunction: 'checkLimit',
    targetLineRange: [18, 45],
    status: 'passed',
    executionTimeMs: 110,
    unexploredPathCoverage: 'Condition: window.requests > maxRequests && !isWhitelisted',
    codeSnippet: `it('should reject 101st request in 60s sliding window with HTTP 429 RateLimitExceeded', async () => {
  const limiter = new SlidingWindowRateLimiter({ limit: 100, windowMs: 60000 });
  const ip = '198.51.100.24';

  for (let i = 0; i < 100; i++) {
    const res = await limiter.checkLimit(ip);
    expect(res.allowed).toBe(true);
  }

  const rejected = await limiter.checkLimit(ip);
  expect(rejected.allowed).toBe(false);
  expect(rejected.retryAfterSec).toBeGreaterThan(0);
});`,
    agentRationale: 'Functional verification of sliding window algorithm ensuring no request leakage across boundary intervals.',
    assertionsCount: 3,
    mutationImpactPct: 7.1,
    createdAt: '2026-09-15 10:42:10',
  },
  {
    id: 'test-5',
    testKey: 'ST-205',
    name: 'test_sql_builder_prevent_nested_identifier_injection',
    category: 'negative',
    targetFile: 'src/database/query_builder.ts',
    targetFunction: 'buildOrderByClause',
    targetLineRange: [92, 115],
    status: 'passed',
    executionTimeMs: 65,
    unexploredPathCoverage: 'Regex match fail branch: /^[a-zA-Z0-9_]+$/',
    codeSnippet: `it('should reject malicious identifier containing comment sequences and semicolons', () => {
  const qb = new QueryBuilder('users');
  expect(() => {
    qb.orderBy('created_at; DROP TABLE users; --', 'ASC');
  }).toThrow(InvalidIdentifierError);
});`,
    agentRationale: 'Synthesized negative input to guarantee SQL column identifier sanitization prevents second-order injection in dynamic order clauses.',
    assertionsCount: 1,
    mutationImpactPct: 3.9,
    createdAt: '2026-09-15 10:42:11',
  },
  {
    id: 'test-6',
    testKey: 'ST-206',
    name: 'test_webhook_dispatcher_retry_exponential_backoff_jitter',
    category: 'exception-handling',
    targetFile: 'src/services/webhook_dispatcher.ts',
    targetFunction: 'dispatchWithRetry',
    targetLineRange: [71, 98],
    status: 'passed',
    executionTimeMs: 310,
    unexploredPathCoverage: 'Loop retry branch (attempts <= maxRetries && is5xxError)',
    codeSnippet: `it('should apply full-jitter exponential backoff on HTTP 503 and abort on 400 Bad Request', async () => {
  const dispatcher = new WebhookDispatcher({ maxRetries: 3, baseDelayMs: 50 });
  const mockEndpoint = nock('https://api.partner.io')
    .post('/webhook')
    .reply(503)
    .post('/webhook')
    .reply(503)
    .post('/webhook')
    .reply(200, { received: true });

  const result = await dispatcher.dispatchWithRetry('https://api.partner.io/webhook', { event: 'ping' });
  expect(result.attempts).toBe(3);
  expect(result.success).toBe(true);
});`,
    agentRationale: 'Exception handling stress test checking backoff calculations and abort logic on non-retriable HTTP status codes.',
    assertionsCount: 2,
    mutationImpactPct: 6.4,
    createdAt: '2026-09-15 10:42:11',
  },
  {
    id: 'test-7',
    testKey: 'ST-207',
    name: 'test_user_profile_json_schema_regression_v1_compatibility',
    category: 'regression',
    targetFile: 'src/models/user_schema.ts',
    targetFunction: 'migrateSchemaV1ToV2',
    targetLineRange: [22, 59],
    status: 'passed',
    executionTimeMs: 74,
    unexploredPathCoverage: 'Legacy parser fallback: if (!payload.preferences.version)',
    codeSnippet: `it('should correctly backfill missing default locale and timezone from v1 payload', () => {
  const legacyPayload = { id: 'u_101', email: 'test@example.com', created: 1600000000 };
  const migrated = migrateSchemaV1ToV2(legacyPayload);

  expect(migrated.version).toBe(2);
  expect(migrated.preferences.locale).toBe('en-US');
  expect(migrated.preferences.timezone).toBe('UTC');
});`,
    agentRationale: 'Regression test guarding against schema migration breaks when handling archived v1 customer records without new metadata fields.',
    assertionsCount: 3,
    mutationImpactPct: 4.8,
    createdAt: '2026-09-15 10:42:12',
  },
  {
    id: 'test-8',
    testKey: 'ST-208',
    name: 'test_crypto_stream_unclean_disconnect_cleanup',
    category: 'exception-handling',
    targetFile: 'src/crypto/stream_cipher.ts',
    targetFunction: 'pipeCipherStream',
    targetLineRange: [104, 132],
    status: 'passed',
    executionTimeMs: 160,
    unexploredPathCoverage: 'Stream onerror event + buffer wipe memory cleanup',
    codeSnippet: `it('should immediately wipe key buffer and destroy stream if read pipe throws unexpectedly', async () => {
  const cipher = new StreamCipher({ algorithm: 'aes-256-gcm' });
  const badStream = new Readable({
    read() { this.destroy(new Error('Simulated socket rupture')); }
  });

  await expect(cipher.process(badStream)).rejects.toThrow('Simulated socket rupture');
  expect(cipher.isKeyZeroed()).toBe(true);
});`,
    agentRationale: 'Verifies zero-tolerance memory hygiene when stream pipeline encounters an abnormal socket termination.',
    assertionsCount: 2,
    mutationImpactPct: 5.7,
    createdAt: '2026-09-15 10:42:13',
  }
];
