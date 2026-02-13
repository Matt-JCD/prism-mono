"use client";

import { useState, useRef, useEffect } from "react";

function Btn({ children, primary, small, onClick, style: sx }: { children: React.ReactNode; primary?: boolean; small?: boolean; onClick?: () => void; style?: React.CSSProperties }) {
  const [h, sH] = useState(false);
  const base = primary
    ? { background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }
    : { background: h ? "#fafbfc" : "#fff", color: "#475569", border: "1px solid #e2e8f0" };
  return (
    <button onClick={onClick} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ padding: small ? "4px 10px" : "7px 14px", borderRadius: small ? 6 : 8, fontSize: small ? 11 : 12.5, fontWeight: primary ? 580 : 520, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...base, ...sx }}>
      {children}
    </button>
  );
}

function buildSteps(company: string, market: string) {
  return {
    research: [
      { action: `Defining competitive landscape for ${market}`, detail: `Search scope: market segments, adjacent categories, geography relevant to ${company}`, dur: 2600 },
      { action: `Scanning venture & funding databases`, detail: `Querying Crunchbase, PitchBook for companies in ${market} — filtering by stage, funding`, dur: 3000 },
      { action: `Crawling product directories & reviews`, detail: `Searching G2, Product Hunt for ${market} solutions — extracting positioning, features`, dur: 2400 },
      { action: `Mining industry analyst reports`, detail: `Scanning Gartner, Forrester for ${market} landscape — identifying market leaders`, dur: 2800 },
      { action: `Harvesting LinkedIn hiring signals`, detail: `Scanning companies with ${market}-related job postings — cross-referencing growth`, dur: 2000 },
      { action: `Compiling competitor shortlist`, detail: `Consolidated profiles across regions. Categorised: direct, adjacent, emerging.`, dur: 1800 },
    ],
    deepdive: [
      { action: `Analysing competitor websites & products`, detail: `Deep crawl of each competitor's product pages, documentation, and pricing`, dur: 2800 },
      { action: `Researching leadership & org changes`, detail: `LinkedIn profiles, appointments, departures — mapping key decision makers`, dur: 2400 },
      { action: `Tracking funding rounds & investors`, detail: `Recent raises, investor signals, runway estimates, board composition`, dur: 2200 },
      { action: `Monitoring press & blog activity`, detail: `Press releases, engineering blogs, conference talks in last 6 months`, dur: 2600 },
      { action: `Mapping job posting patterns`, detail: `Role types, team sizes, hiring velocity — signals of strategic direction`, dur: 2000 },
    ],
    report: [
      { action: `Structuring competitive intelligence report`, detail: `Market map, tier classification, strategic positioning framework`, dur: 2200 },
      { action: `Writing competitor deep dives`, detail: `Individual profiles with SWOT, leadership, product, and market analysis`, dur: 3000 },
      { action: `Synthesising strategic recommendations`, detail: `Risk assessment, opportunity mapping, recommended positioning for ${company}`, dur: 2400 },
      { action: `Generating downloadable report`, detail: `Final intelligence brief with executive summary and detailed appendices`, dur: 1800 },
    ],
  };
}

type AgentId = "research" | "deepdive" | "report";
type StepMap = ReturnType<typeof buildSteps>;

export default function CompIntel() {
  const [company, setCompany] = useState("");
  const [market, setMarket] = useState("");
  const [running, setRunning] = useState(false);
  const [agentStates, setAS] = useState<Record<AgentId, { status: string; step: number }>>({
    research: { status: "idle", step: -1 },
    deepdive: { status: "idle", step: -1 },
    report: { status: "idle", step: -1 },
  });
  const [steps, setSteps] = useState<StepMap | null>(null);
  const [audit, setAudit] = useState<{ agent: string; action: string; time: string }[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addAudit = (entry: { agent: string; action: string }) => setAudit((prev) => [{ ...entry, time: new Date().toLocaleTimeString() }, ...prev]);

  const runAgent = (agentId: AgentId, agentSteps: { action: string; detail: string; dur: number }[], delay: number, onDone?: () => void) => {
    let cumulative = delay;

    timers.current.push(setTimeout(() => {
      setAS((p) => ({ ...p, [agentId]: { status: "running", step: 0 } }));
      addAudit({ agent: agentId, action: `${agentId} started` });
    }, cumulative));

    agentSteps.forEach((step, i) => {
      cumulative += step.dur;
      timers.current.push(setTimeout(() => {
        setAS((p) => ({ ...p, [agentId]: { ...p[agentId], step: i } }));
        addAudit({ agent: agentId, action: step.action });
      }, cumulative));
    });

    cumulative += 800;
    timers.current.push(setTimeout(() => {
      setAS((p) => ({ ...p, [agentId]: { status: "complete", step: agentSteps.length - 1 } }));
      addAudit({ agent: agentId, action: `${agentId} complete \u2713` });
      if (onDone) onDone();
    }, cumulative));
  };

  const start = () => {
    if (!company.trim() || !market.trim() || running) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const s = buildSteps(company.trim(), market.trim());
    setSteps(s);
    setRunning(true);
    setAS({ research: { status: "idle", step: -1 }, deepdive: { status: "idle", step: -1 }, report: { status: "idle", step: -1 } });
    setAudit([]);
    addAudit({ agent: "orchestrator", action: `Workflow started: ${company} in ${market}` });

    runAgent("research", s.research, 400, () => {
      addAudit({ agent: "orchestrator", action: "Handoff: Discovery \u2192 Deep Dive" });
      runAgent("deepdive", s.deepdive, 800, () => {
        addAudit({ agent: "orchestrator", action: "Handoff: Deep Dive \u2192 Report" });
        runAgent("report", s.report, 800, () => {
          setRunning(false);
          addAudit({ agent: "orchestrator", action: "Report generated \u2713" });
        });
      });
    });
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const agentDefs: { id: AgentId; name: string; icon: string; color: string }[] = [
    { id: "research", name: "Discovery Agent", icon: "\u{1F50D}", color: "#3B82F6" },
    { id: "deepdive", name: "Deep Dive Agent", icon: "\u{1F52C}", color: "#8B5CF6" },
    { id: "report", name: "Report Agent", icon: "\u{1F4CA}", color: "#10B981" },
  ];

  const auditColors: Record<string, string> = { orchestrator: "#f59e0b", research: "#3B82F6", deepdive: "#8B5CF6", report: "#10B981" };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #e8ecf1", background: "#fff" }}>
        <h2 style={{ fontSize: 18, fontWeight: 660, color: "#0f172a", margin: 0 }}>Competitive Intelligence</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0" }}>Three-agent workflow: discover, analyse, report</p>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name (e.g. Telstra)"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: "#0f172a", fontFamily: "inherit", outline: "none", background: "#fff" }}
            onFocus={(e) => (e.target.style.borderColor = "#a5b4fc")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            onKeyDown={(e) => e.key === "Enter" && start()} />
          <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Market / industry (e.g. networking)"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: "#0f172a", fontFamily: "inherit", outline: "none", background: "#fff" }}
            onFocus={(e) => (e.target.style.borderColor = "#a5b4fc")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            onKeyDown={(e) => e.key === "Enter" && start()} />
          <Btn primary onClick={start} style={{ opacity: !company.trim() || !market.trim() || running ? 0.5 : 1 }}>
            {running ? "\u23F3 Running..." : "\u25B6 Run Analysis"}
          </Btn>
        </div>
      </div>

      {/* Body: agent lanes + audit trail */}
      <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
        {/* Three agent lanes */}
        <div style={{ flex: 1, display: "flex" }}>
          {agentDefs.map((agent) => {
            const st = agentStates[agent.id];
            const agentSteps = steps ? steps[agent.id] || [] : [];

            return (
              <div key={agent.id} style={{ flex: 1, borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
                {/* Agent header */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{agent.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: st.status === "running" ? agent.color : st.status === "complete" ? "#059669" : "#94a3b8", fontWeight: 550, marginTop: 2 }}>
                        {st.status === "idle" ? "Waiting" : st.status === "running" ? "Running..." : "Complete \u2713"}
                      </div>
                    </div>
                  </div>
                  {st.status !== "idle" && agentSteps.length > 0 && (
                    <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(((st.step + 1) / agentSteps.length) * 100, 100)}%`, borderRadius: 2, background: agent.color, transition: "width 0.5s ease" }} />
                    </div>
                  )}
                </div>

                {/* Step cards */}
                <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
                  {agentSteps.length > 0 ? agentSteps.map((step, i) => {
                    const isActive = st.step === i && st.status === "running";
                    const isDone = st.step > i || (st.step === i && st.status === "complete");
                    return (
                      <div key={i} style={{
                        padding: "10px 12px", marginBottom: 5, borderRadius: 10,
                        background: isActive ? "rgba(99,102,241,0.04)" : isDone ? "rgba(16,185,129,0.03)" : "#fff",
                        border: `1px solid ${isActive ? "rgba(99,102,241,0.15)" : isDone ? "rgba(16,185,129,0.08)" : "#f1f5f9"}`,
                        opacity: st.step >= i ? 1 : 0.35, transition: "all 0.3s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12 }}>{isDone ? "\u2705" : isActive ? "\u{1F504}" : "\u23F8"}</span>
                          <span style={{ fontSize: 12, fontWeight: 560, color: isDone ? "#059669" : isActive ? "#4f46e5" : "#94a3b8" }}>{step.action}</span>
                        </div>
                        {(isActive || isDone) && (
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4, paddingLeft: 22 }}>{step.detail}</div>
                        )}
                      </div>
                    );
                  }) : (
                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Enter a company and market to begin</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit trail sidebar */}
        <div style={{ width: 260, borderLeft: "1px solid #e8ecf1", background: "#fafbfc", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a" }}>Audit Trail</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{audit.length} events</div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 6 }}>
            {audit.map((entry, i) => (
              <div key={i} style={{ padding: "5px 8px", marginBottom: 2, borderRadius: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: auditColors[entry.agent] || "#94a3b8", flexShrink: 0 }} />
                  <span style={{ color: "#94a3b8", fontSize: 10 }}>{entry.time}</span>
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2, paddingLeft: 11 }}>{entry.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
