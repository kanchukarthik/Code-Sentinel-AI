# CodeSentinel AI — Autonomous Multi-Agent Engineering Dashboard

A production-quality developer dashboard for **CodeSentinel AI**, a Cognitive Multi-Agent LLM-based Autonomous Software Engineering framework. It performs proactive bug discovery, automated test synthesis, and self-healing program repair on target codebases.

---

## The 7-Agent Cognitive Architecture

```
[Target Codebase]
       │
       ▼
1. Code Intelligence Agent ──► Analyzes AST, dependencies, complexity hot-spots, and coverage deficits
       │
       ▼
2. Test Synthesis Agent   ──► Synthesizes boundary, functional, negative, regression & exception tests
       │
       ▼
3. Execution Agent        ──► Dispatches test suites into isolated V8 sandboxes; instruments traces & coverage
       │
       ▼
4. Bug Detection Agent    ──► Flags defects, assertion failures, memory leaks, and unhandled exceptions
       │
       ▼
5. Root-Cause Agent       ──► Spectrum-Based Fault Localization (SBFL Ochiai metric) & slice isolation
       │
       ▼
6. Self-Healing Agent     ──► Generates candidate repair patches via beam search & LLM-based AST edits
       │
       ▼
7. Validation Agent       ──► Dual verification: baseline + synthesized test runs; checks regressions & mutation score
```

---

## Core Screens & Capabilities

1. **Overview / Home Dashboard (`/`)**:
   - Primary KPI summary scorecards (Coverage %, Mutation Score, Open Defects, Patch Success Rate, Synthesized Tests).
   - Real-time active pipeline run status banner with progress indicator across all 7 agents.
   - Interactive Recharts trend charts (Coverage vs Mutation Score, Defect Rate vs Patch Success).
   - Recent activity feed of the latest pipeline runs with status badges and quick inspection links.

2. **Pipeline / Live Run View (`/pipeline`)**:
   - Visual 7-stage DAG graph with colorblind-safe status indicators (`idle`, `running`, `passed`, `failed`, `warning`).
   - Pulsing animations and real-time execution progress tickers for active agents.
   - Interactive simulation engine: Start Run, Pause, Resume, Speed (1x, 2x, 5x), and Reset Demo.
   - Multiplexed Agent Terminal Log Viewer with real-time autoscroll, pause toggle, search/grep, and level filtering (`INFO`, `AGENT`, `WARN`, `ERROR`).
   - Stage Detail Inspector Modal: Displays agent mission, assigned LLM, prompt templates, and output artifacts.

3. **Test Synthesis View (`/tests`)**:
   - Inventory of synthesized tests classified by category: **Functional**, **Boundary**, **Negative**, **Regression**, and **Exception-Handling**.
   - Filters by category, status (`passed`, `failed`, `flaky`), target file, and function name.
   - Expandable test drawer: Monospace code viewer with one-click copy, target execution path, mutation testing impact, and agent rationale.

4. **Bug & Root-Cause View (`/bugs`)**:
   - Master-detail defect catalog with severity pills (**Critical**, **High**, **Medium**, **Low**) and confidence percentages.
   - Visual **Spectrum-Based Fault Localization (SBFL)** Ochiai heatmap ranking suspect code lines ($S_{Ochiai} = \frac{n_{cf}}{\sqrt{n_f \cdot (n_{cf} + n_{cs})}}$).
   - Sandbox execution failure stack traces with highlighted fault lines.
   - Cognitive root-cause diagnosis from the Root-Cause Analysis Agent.

5. **Self-Healing / Patch Review View (`/patches`)**:
   - Candidate patch management with strategy categorization (e.g. BigNumber scaling, exponential backoff jitter).
   - Git-style unified and split side-by-side **Diff Viewer** with syntax highlighting and line numbers.
   - **Validation Report**: Dual verification scorecard (baseline tests, synthetic tests, regressions introduced, false-positive risk score).
   - Interactive one-click actions: **Approve & Merge**, **Reject**, and **Rollback** (with confirmation dialog and rationale logging).

6. **Metrics & History View (`/metrics`)**:
   - Longitudinal evaluation charts for all 7 evaluation criteria:
     1. Code coverage %
     2. Mutation score %
     3. Defect detection rate %
     4. Fault-localization accuracy (Top-1 SBFL hit rate)
     5. False-positive rate %
     6. Patch success rate %
     7. Execution efficiency (pipeline seconds & token consumption)
   - **Side-by-Side Run Comparator**: Select any two runs (Target vs Baseline) to compute net deltas in coverage, mutation score, defects, and duration.

7. **Settings (`/settings`)**:
   - Repository connection configuration (Git URL, active branch, mutation depth).
   - Autonomous merge policy (Human-in-the-loop, auto-approve high confidence, fully autonomous).
   - Test synthesis category toggles.
   - Model selection per cognitive agent (Claude 3.7 Sonnet, GPT-4o, DeepSeek-Coder-V2, Gemini 1.5 Pro).

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (dark-mode first, colorblind-safe visual states)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6

---

## Running the Application

### Local development

Start the backend from the `backend` directory in one terminal:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the frontend from the project root in another terminal:

```bash
npm run dev
```

Open **http://localhost:5173/**. The frontend proxies API and WebSocket requests
to the backend, so the application is used through this single browser address.

### Single-address Docker deployment

Run `docker compose up --build` from the project root, then open
**http://localhost:3000/**. The frontend reverse-proxies backend API and
WebSocket traffic; only the frontend port is published to the host.

To build the frontend separately, run `npm run build`.

---

## Mock Data & API / WebSocket Contract (Backend Integration Guide)

The frontend is decoupled from the data layer via `src/context/PipelineContext.tsx` and strongly typed in `src/types/api.ts`. To swap the mock/simulation layer with a real backend, implement the following endpoints and WebSocket events:

### 1. WebSocket Streaming Endpoint (`ws://host/api/v1/pipeline/ws`)

Upon connecting, the backend streams the following JSON messages to the client:

#### A. Initial Pipeline State
```json
{
  "event": "PIPELINE_INIT",
  "timestamp": "2026-09-15T10:42:01.000Z",
  "runId": "run-142",
  "payload": {
    "run": {
      "id": "run-142",
      "runNumber": 142,
      "repoId": "repo-1",
      "branch": "feat/arbitrary-precision-math",
      "commitHash": "8b771e3",
      "status": "running",
      "stages": [...]
    }
  }
}
```

#### B. Agent Status & Progress Event
```json
{
  "event": "AGENT_STATUS_CHANGED",
  "timestamp": "2026-09-15T10:42:06.155Z",
  "runId": "run-142",
  "payload": {
    "agentId": "test-synthesis",
    "status": "running",
    "action": "Synthesizing boundary tests for ledger_reconciler.ts:142",
    "telemetry": {
      "tokensUsed": 28400,
      "memoryMb": 360,
      "cpuPct": 52
    }
  }
}
```

#### C. Live Agent Console Log Emission
```json
{
  "event": "AGENT_LOG",
  "timestamp": "2026-09-15T10:42:07.820Z",
  "runId": "run-142",
  "payload": {
    "log": {
      "id": "log-6",
      "timestamp": "10:42:07.820",
      "level": "AGENT",
      "agentId": "test-synthesis",
      "message": "[TestSynth] Synthesized boundary test case: `test_reconciler_floating_point_precision_overflow`"
    }
  }
}
```

#### D. Bug Detected Event (Ochiai SBFL Localization)
```json
{
  "event": "BUG_DETECTED",
  "timestamp": "2026-09-15T10:42:20.980Z",
  "runId": "run-142",
  "payload": {
    "bug": {
      "id": "bug-1",
      "bugKey": "BUG-401",
      "title": "Precision truncation in fractional reconciliation",
      "severity": "critical",
      "targetFile": "src/payment/ledger_reconciler.ts",
      "targetLine": 142,
      "detectionConfidence": 97.4,
      "stackTrace": "...",
      "rootCauseExplanation": "...",
      "faultLocalizationRanking": [
        { "line": 142, "score": 0.948, "code": "totalDelta = totalDelta - parseFloat(item.delta);", "isSuspect": true, "rank": 1 }
      ]
    }
  }
}
```

#### E. Patch Generated Event
```json
{
  "event": "PATCH_GENERATED",
  "timestamp": "2026-09-15T10:42:30.000Z",
  "runId": "run-142",
  "payload": {
    "patch": {
      "id": "patch-1",
      "patchKey": "PATCH-801",
      "bugId": "bug-1",
      "status": "candidate",
      "diff": {
        "oldPath": "src/payment/ledger_reconciler.ts",
        "newPath": "src/payment/ledger_reconciler.ts",
        "additions": 11,
        "deletions": 4,
        "hunks": [...]
      },
      "validation": {
        "baselineTestsPassed": 84,
        "baselineTestsTotal": 84,
        "synthesizedTestsPassed": 14,
        "synthesizedTestsTotal": 14,
        "regressionsIntroduced": 0,
        "mutationScoreDeltaPct": 5.4,
        "falsePositiveRiskScore": 0.02,
        "verdict": "verified"
      }
    }
  }
}
```

---

### 2. REST Endpoints

- **`POST /api/v1/pipeline/trigger`**
  - Trigger a new autonomous run on the target repository.
  - Body: `{ "repoId": "repo-1", "branch": "feat/arbitrary-precision-math", "testCategories": ["functional", "boundary", ...] }`
  - Response: `{ "runId": "run-143", "status": "started", "pipelineUrl": "/pipeline" }`

- **`POST /api/v1/patches/:patchId/action`**
  - Approve, reject, or rollback a self-healing candidate patch.
  - Body: `{ "action": "approve" | "reject" | "rollback", "notes": "...", "rollbackReason": "..." }`
  - Response: `{ "patchId": "patch-1", "newStatus": "approved", "updatedAt": "2026-09-15 10:44:12" }`

- **`GET /api/v1/metrics/history`**
  - Retrieve longitudinal evaluation metrics across runs.
  - Returns an array of `EvaluationMetricTrend` objects matching the Recharts schema in `src/types/metrics.ts`.

- **`PUT /api/v1/settings`**
  - Persist autonomous engine configurations, model assignments, and confidence gates.
#   C o d e - S e n t i n e l - A I  
 #   C o d e - S e n t i n e l - A I  
 