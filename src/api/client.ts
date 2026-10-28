/**
 * REST and WebSocket client for CodeSentinel AI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';
const WS_BASE = import.meta.env.VITE_WS_BASE
  || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1`;

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(`API Error [${res.status}] ${endpoint}: ${errorDetail}`);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; agents: string[]; llm_provider: string }>('/health'),

  // Projects
  getProjects: () => fetchJson<any[]>('/projects'),
  getProject: (id: string) => fetchJson<any>(`/projects/${id}`),
  uploadProjectZip: async (name: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) formData.append('description', description);
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json();
  },

  // Runs
  getRuns: (projectId?: string) =>
    fetchJson<any[]>(projectId ? `/runs?project_id=${projectId}` : '/runs'),
  getRun: (runId: string) => fetchJson<any>(`/runs/${runId}`),
  getRunAgents: (runId: string) => fetchJson<any[]>(`/runs/${runId}/agents`),
  triggerRun: (projectId: string, payload: { trigger?: string; branch?: string; agents?: string[] } = {}) =>
    fetchJson<any>(`/projects/${projectId}/runs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelRun: (runId: string) =>
    fetchJson<any>(`/runs/${runId}/cancel`, { method: 'POST' }),

  // Tests & Execution
  getRunTests: (runId: string, category?: string) =>
    fetchJson<any[]>(`/runs/${runId}/tests${category ? `?category=${category}` : ''}`),
  getRunTestResults: (runId: string) =>
    fetchJson<any[]>(`/runs/${runId}/test-results`),

  // Defects & Root Cause
  getRunBugs: (runId: string) => fetchJson<any[]>(`/runs/${runId}/bugs`),
  getRunRootCauses: (runId: string) => fetchJson<any[]>(`/runs/${runId}/root-causes`),

  // Patches & Self-Healing
  getRunPatches: (runId: string) => fetchJson<any[]>(`/runs/${runId}/patches`),
  approvePatch: (patchId: string, notes?: string) =>
    fetchJson<any>(`/patches/${patchId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  rejectPatch: (patchId: string, reason?: string) =>
    fetchJson<any>(`/patches/${patchId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  rollbackPatch: (patchId: string, reason: string) =>
    fetchJson<any>(`/patches/${patchId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Metrics
  getRunMetrics: (runId: string) => fetchJson<any>(`/runs/${runId}/metrics`),
  getRunCoverage: (runId: string) => fetchJson<any>(`/runs/${runId}/coverage`),
  getMetricsSummary: (projectId?: string) =>
    fetchJson<any>(`/metrics/summary${projectId ? `?project_id=${projectId}` : ''}`),

  // Feedback loop
  getFeedbackRecords: (runId?: string) =>
    fetchJson<any[]>(`/feedback${runId ? `?run_id=${runId}` : ''}`),

  // Settings
  getSettings: () => fetchJson<any>('/settings'),
  updateSettings: (settings: any) =>
    fetchJson<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // WebSocket Subscription
  subscribeRunEvents: (runId: string, onEvent: (event: any) => void, onError?: (err: any) => void) => {
    let ws: WebSocket | null = null;
    let isClosing = false;

    try {
      ws = new WebSocket(`${WS_BASE}/ws/runs/${runId}`);

      ws.onopen = () => {
        // Send initial ping to keep alive
        setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          onEvent(parsed);
        } catch {
          // ignore malformed
        }
      };

      ws.onerror = (err) => {
        if (!isClosing && onError) onError(err);
      };

      ws.onclose = () => {
        // Closed
      };
    } catch (e) {
      if (onError) onError(e);
    }

    return () => {
      isClosing = true;
      if (ws) {
        ws.close();
      }
    };
  },
};
