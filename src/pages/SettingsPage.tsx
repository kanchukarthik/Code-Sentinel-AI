import React, { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { AgentId } from '../types/agent';
import { AutoHealPolicy } from '../types/settings';
import {
  Settings,
  FolderGit2,
  Cpu,
  FlaskConical,
  Bell,
  ShieldCheck,
  Save,
  Check,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, activeRepo } = usePipeline();

  const [formSettings, setFormSettings] = useState(settings);
  const [repoUrl, setRepoUrl] = useState(activeRepo.url);
  const [activeBranch, setActiveBranch] = useState(activeRepo.activeBranch);
  const [saved, setSaved] = useState<boolean>(false);

  const handleTestTypeToggle = (key: keyof typeof settings.enabledTestTypes) => {
    setFormSettings((prev) => ({
      ...prev,
      enabledTestTypes: {
        ...prev.enabledTestTypes,
        [key]: !prev.enabledTestTypes[key],
      },
    }));
  };

  const handleAgentModelChange = (agentId: AgentId, model: string) => {
    setFormSettings((prev) => ({
      ...prev,
      agentModels: {
        ...prev.agentModels,
        [agentId]: model,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const availableModels = [
    'Claude 3.7 Sonnet',
    'GPT-4o',
    'DeepSeek-Coder-V2',
    'Gemini 1.5 Pro',
    'Native Sandbox V8',
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            <span>Autonomous Engine Configuration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure agent LLM models, test synthesis parameters, repository hooks, and auto-heal policies
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 text-white" />
              <span>Saved Settings</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Section 1: Codebase & Git Provider Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FolderGit2 className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Target Repository Connection</h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Repository Git URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Active Monitored Branch
                </label>
                <input
                  type="text"
                  value={activeBranch}
                  onChange={(e) => setActiveBranch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mutation Testing Depth
                </label>
                <select
                  value={formSettings.mutationTestingDepth}
                  onChange={(e) =>
                    setFormSettings((prev) => ({
                      ...prev,
                      mutationTestingDepth: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="light">Light (Fast CI)</option>
                  <option value="standard">Standard (Balanced)</option>
                  <option value="exhaustive">Exhaustive (Deep)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Auto-Healing & Self-Repair Policies */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Self-Healing Policy & Confidence Gate</h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Autonomous Merge Policy
              </label>
              <select
                value={formSettings.autoHealPolicy}
                onChange={(e) =>
                  setFormSettings((prev) => ({
                    ...prev,
                    autoHealPolicy: e.target.value as AutoHealPolicy,
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="human_review">Human-in-the-loop Only (Recommended)</option>
                <option value="auto_approve_high_confidence">
                  Auto-approve if Confidence &gt; 95% and 0 Regressions
                </option>
                <option value="autonomous">Fully Autonomous Continuous Self-Repair</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Minimum Confidence Threshold for Candidate Generation:
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {formSettings.confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={formSettings.confidenceThreshold}
                onChange={(e) =>
                  setFormSettings((prev) => ({
                    ...prev,
                    confidenceThreshold: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Test Synthesis Category Toggles */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FlaskConical className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Active Test Synthesis Categories</h3>
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            {(
              [
                { key: 'functional', label: 'Functional Happy-Path Tests', desc: 'Validates expected business logic specifications' },
                { key: 'boundary', label: 'Boundary & Extremum Tests', desc: 'Stress tests min/max, epsilon, and integer limit boundaries' },
                { key: 'negative', label: 'Negative & Invalidation Tests', desc: 'Injects invalid, malformed, or malicious payloads' },
                { key: 'regression', label: 'Regression Compatibility Tests', desc: 'Guards against breaking legacy schemas and contracts' },
                { key: 'exceptionHandling', label: 'Exception & Fault Handling Tests', desc: 'Verifies timeout, socket disconnect, and error bubbles' },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:bg-slate-950 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formSettings.enabledTestTypes[item.key]}
                  onChange={() => handleTestTypeToggle(item.key)}
                  className="mt-0.5 h-4 w-4 rounded accent-cyan-500"
                />
                <div>
                  <span className="font-semibold text-white block">{item.label}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 4: LLM Model Selection per Cognitive Agent */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Cognitive Agent LLM Assignments</h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {(
              [
                { id: 'code-intelligence', name: '01. Code Intelligence Agent' },
                { id: 'test-synthesis', name: '02. Test Synthesis Agent' },
                { id: 'execution', name: '03. Execution Agent' },
                { id: 'bug-detection', name: '04. Bug Detection Agent' },
                { id: 'root-cause', name: '05. Root-Cause Analysis Agent' },
                { id: 'self-healing', name: '06. Self-Healing / Repair Agent' },
                { id: 'validation', name: '07. Validation Agent' },
              ] as { id: AgentId; name: string }[]
            ).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2"
              >
                <span className="font-medium text-slate-200">{agent.name}</span>
                <select
                  value={formSettings.agentModels[agent.id] || availableModels[0]}
                  onChange={(e) => handleAgentModelChange(agent.id, e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
