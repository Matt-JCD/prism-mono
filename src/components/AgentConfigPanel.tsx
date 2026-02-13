"use client";

import { useState, useEffect, useCallback } from "react";

interface AgentConfigData {
  agentName: string;
  model: string;
  maxTokens: number;
  enabled: boolean;
}

interface ConnectionResult {
  ok: boolean;
  message: string;
}

const agentMeta: Record<string, { label: string; icon: string; module: string }> = {
  "ci-discovery": { label: "Discovery Agent", icon: "\u{1F50D}", module: "Comp Intel" },
  "ci-deep-dive": { label: "Deep Dive Agent", icon: "\u{1F52C}", module: "Comp Intel" },
  "ci-report": { label: "Report Agent", icon: "\u{1F4CA}", module: "Comp Intel" },
  "signal-scanner": { label: "Signal Scanner", icon: "\u{1F4E1}", module: "Signal Tracker" },
  "org-import": { label: "Org Import (Attio)", icon: "\u{1F4C7}", module: "Org Mapper" },
};

const modelOptions = [
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
];

export default function AgentConfigPanel({ onClose }: { onClose: () => void }) {
  const [configs, setConfigs] = useState<AgentConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, ConnectionResult> | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/settings/agents")
      .then(r => r.json())
      .then(setConfigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = useCallback(async (agentName: string, updates: Partial<AgentConfigData>) => {
    setConfigs(prev => prev.map(c => c.agentName === agentName ? { ...c, ...updates } : c));
    try {
      await fetch("/api/settings/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, ...updates }),
      });
    } catch { /* silently handle */ }
  }, []);

  const testConnections = useCallback(async () => {
    setTesting(true);
    setTestResults(null);
    try {
      const res = await fetch("/api/settings/agents/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const results = await res.json();
      setTestResults(results);
    } catch {
      setTestResults({ error: { ok: false, message: "Test request failed" } });
    } finally {
      setTesting(false);
    }
  }, []);

  // Group agents by module
  const grouped = configs.reduce<Record<string, AgentConfigData[]>>((acc, c) => {
    const module = agentMeta[c.agentName]?.module || "Other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(c);
    return acc;
  }, {});

  return (
    <div className="w-[380px] shrink-0 bg-white border-r border-[#e8ecf1] flex flex-col overflow-hidden shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e8ecf1]">
        <div>
          <h3 className="text-sm font-semibold text-[#0f172a] m-0">Settings</h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">Agent configuration & connections</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#64748b]">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Connection Status */}
      <div className="p-3 border-b border-[#e8ecf1]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#0f172a]">Service Connections</span>
          <button
            onClick={testConnections}
            disabled={testing}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] text-[#6366f1] cursor-pointer hover:bg-[rgba(99,102,241,0.08)] disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test All"}
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {["anthropic", "tavily", "attio", "database"].map(svc => {
            const result = testResults?.[svc];
            return (
              <div key={svc} className="flex items-center gap-2 py-1 px-2">
                <div className={`w-2 h-2 rounded-full ${result ? (result.ok ? "bg-[#10b981]" : "bg-[#ef4444]") : "bg-[#e2e8f0]"}`} />
                <span className="text-xs font-medium text-[#0f172a] capitalize flex-1">{svc}</span>
                {result && (
                  <span className={`text-[10px] ${result.ok ? "text-[#059669]" : "text-[#ef4444]"}`}>
                    {result.message}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Configs */}
      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="text-center py-8 text-[#94a3b8] text-xs">Loading...</div>
        ) : (
          Object.entries(grouped).map(([module, agents]) => (
            <div key={module} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-semibold text-[#0f172a] tracking-wide">{module}</span>
              </div>
              <div className="flex flex-col gap-2">
                {agents.map(agent => {
                  const meta = agentMeta[agent.agentName];
                  return (
                    <div key={agent.agentName} className="p-3 rounded-xl border border-[#f1f5f9] bg-white hover:border-[#e2e8f0] transition-all">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-lg">{meta?.icon || "\u2699\uFE0F"}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-[#0f172a]">{meta?.label || agent.agentName}</span>
                        </div>
                        <button
                          onClick={() => updateConfig(agent.agentName, { enabled: !agent.enabled })}
                          className="relative"
                        >
                          <div className={`w-8 h-[18px] rounded-full p-[2px] transition-colors ${agent.enabled ? "bg-gradient-to-r from-[#6366f1] to-[#818cf8]" : "bg-[#e2e8f0]"}`}>
                            <div className={`w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${agent.enabled ? "translate-x-[14px]" : "translate-x-0"}`} />
                          </div>
                        </button>
                      </div>
                      {agent.enabled && (
                        <div className="flex gap-2 mt-2">
                          <select
                            value={agent.model}
                            onChange={e => updateConfig(agent.agentName, { model: e.target.value })}
                            className="flex-1 text-[11px] px-2 py-1 rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] outline-none"
                          >
                            {modelOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          <input
                            type="number"
                            value={agent.maxTokens}
                            onChange={e => updateConfig(agent.agentName, { maxTokens: parseInt(e.target.value) || 1000 })}
                            className="w-20 text-[11px] px-2 py-1 rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] outline-none"
                            min={100}
                            max={16000}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#e8ecf1]">
        <p className="text-[10px] text-[#94a3b8] text-center">API keys are configured via environment variables (.env)</p>
      </div>
    </div>
  );
}
