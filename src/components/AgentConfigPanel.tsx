"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MODULE_AGENTS } from "@/lib/data";

const pathToModule: Record<string, string> = {
  "/org-mapper": "orgMapper",
  "/comp-intel": "compIntel",
  "/signal-tracker": "signalTracker",
};

export default function AgentConfigPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const currentModule = pathToModule[pathname] || "";

  return (
    <div className="w-[340px] shrink-0 bg-white border-r border-[#e8ecf1] flex flex-col overflow-hidden shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e8ecf1]">
        <div>
          <h3 className="text-sm font-semibold text-[#0f172a] m-0">Agent Configuration</h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">Manage connected agents</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#64748b]">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Agent groups */}
      <div className="flex-1 overflow-auto p-3">
        {Object.entries(MODULE_AGENTS).map(([key, group]) => {
          const isCurrent = key === currentModule;
          return (
            <div key={key} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-base">{group.icon}</span>
                <span className="text-xs font-semibold text-[#0f172a] tracking-wide">{group.label}</span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(99,102,241,0.08)] text-[#6366f1] border border-[rgba(99,102,241,0.15)]">
                    Current
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {group.agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: { id: string; name: string; icon: string; status: string; desc: string; apiKeys: string[] } }) {
  const [hovered, setHovered] = useState(false);
  const isConfigured = agent.status === "configured";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`p-3 rounded-xl border transition-all duration-150
        ${hovered ? "border-[#e2e8f0] bg-[#fafbfc] shadow-sm" : "border-[#f1f5f9] bg-white"}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0f172a]">{agent.name}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded
              ${isConfigured
                ? "bg-[rgba(16,185,129,0.08)] text-[#059669] border border-[rgba(16,185,129,0.15)]"
                : "bg-[rgba(100,116,139,0.06)] text-[#94a3b8] border border-[rgba(100,116,139,0.1)]"}`}>
              {isConfigured ? "Connected" : "Not configured"}
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1 leading-snug">{agent.desc}</p>
          {agent.apiKeys.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.apiKeys.map(key => (
                <span key={key} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#f8fafc] text-[#94a3b8] border border-[#f1f5f9]">
                  {key}
                </span>
              ))}
            </div>
          )}
          {hovered && (
            <button className={`mt-2 text-[11px] font-medium px-2.5 py-1 rounded-md border cursor-pointer transition-colors
              ${isConfigured
                ? "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                : "border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] text-[#6366f1] hover:bg-[rgba(99,102,241,0.08)]"}`}>
              {isConfigured ? "Configure" : "Connect"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
