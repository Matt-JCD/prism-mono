"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GICS_SECTORS, GICS_SECTOR_LIST, TARGET_GEOGRAPHIES } from "@/lib/constants/gics";
import { COUNTRIES } from "@/lib/constants/countries";
import type { SSEEvent, CompetitorCard, ReportSummary, CompanyProfile } from "../../agents/shared/types";
import CompetitorCardComponent from "./CompetitorCard";
import ReportSummarySection from "./ReportSummarySection";

interface AnalysisState {
  status: "idle" | "running" | "done" | "error";
  events: SSEEvent[];
  profile: CompanyProfile | null;
  competitors: CompetitorCard[];
  summary: ReportSummary | null;
  error: string | null;
}

const initialState: AnalysisState = {
  status: "idle",
  events: [],
  profile: null,
  competitors: [],
  summary: null,
  error: null,
};

export default function CompIntel() {
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [hq, setHq] = useState("");
  const [targetGeo, setTargetGeo] = useState<string[]>([]);
  const [knownCompetitors, setKnownCompetitors] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisState>(initialState);
  const [activeTab, setActiveTab] = useState<"activity" | "report">("activity");
  const abortRef = useRef<AbortController | null>(null);
  const eventLogRef = useRef<HTMLDivElement>(null);

  const subIndustries = industry ? GICS_SECTORS[industry] || [] : [];
  const canSubmit = domain.trim() && industry && subIndustry && analysis.status !== "running";

  useEffect(() => {
    setSubIndustry("");
  }, [industry]);

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [analysis.events]);

  const toggleGeo = useCallback((geo: string) => {
    setTargetGeo(prev => prev.includes(geo) ? prev.filter(g => g !== geo) : [...prev, geo]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnalysis({ ...initialState, status: "running" });
    setActiveTab("activity");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          industry,
          subIndustry,
          hq: hq || undefined,
          targetGeography: targetGeo.length ? targetGeo : undefined,
          knownCompetitors: knownCompetitors.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Analysis failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: SSEEvent = JSON.parse(line.slice(6));
            setAnalysis(prev => {
              const next = { ...prev, events: [...prev.events, event] };

              if (event.type === "done" && event.data) {
                const d = event.data as { profile: CompanyProfile; competitors: CompetitorCard[]; summary: ReportSummary };
                next.status = "done";
                next.profile = d.profile;
                next.competitors = d.competitors;
                next.summary = d.summary;
              } else if (event.type === "error") {
                next.error = event.detail || "Unknown error";
              } else if (event.type === "discovery" && event.data) {
                const d = event.data as { profile: CompanyProfile; competitors: CompetitorCard[] };
                next.profile = d.profile;
              } else if (event.type === "deep-dive" && event.data) {
                const d = event.data as { competitors: CompetitorCard[] };
                next.competitors = d.competitors;
              } else if (event.type === "report" && event.data) {
                const d = event.data as { summary: ReportSummary; competitors: CompetitorCard[] };
                next.summary = d.summary;
                next.competitors = d.competitors;
              }

              return next;
            });
          } catch { /* skip malformed */ }
        }
      }

      setAnalysis(prev => prev.status === "running" ? { ...prev, status: "done" } : prev);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAnalysis(prev => ({ ...prev, status: "error", error: (err as Error).message }));
      }
    }
  }, [canSubmit, domain, industry, subIndustry, hq, targetGeo, knownCompetitors]);

  useEffect(() => {
    if (analysis.status === "done" && analysis.summary) {
      setActiveTab("report");
    }
  }, [analysis.status, analysis.summary]);

  const agentColors: Record<string, string> = {
    orchestrator: "#f59e0b",
    discovery: "#3B82F6",
    "deep-dive": "#8B5CF6",
    report: "#10B981",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header + Form */}
      <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #e8ecf1", background: "#fff" }}>
        <h2 style={{ fontSize: 18, fontWeight: 660, color: "#0f172a", margin: 0 }}>Competitive Intelligence</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0" }}>Three-agent workflow: discover, analyse, report</p>

        {/* Row 1: Domain + Industry + Sub-industry */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <input
            value={domain} onChange={e => setDomain(e.target.value)}
            placeholder="Company domain (e.g. crowdstrike.com)"
            style={{ flex: 2, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: "#0f172a", fontFamily: "inherit", outline: "none", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <select
            value={industry} onChange={e => setIndustry(e.target.value)}
            style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: industry ? "#0f172a" : "#94a3b8", fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="">Industry (GICS Sector)</option>
            {GICS_SECTOR_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={subIndustry} onChange={e => setSubIndustry(e.target.value)}
            disabled={!industry}
            style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: subIndustry ? "#0f172a" : "#94a3b8", fontFamily: "inherit", outline: "none", background: "#fff", cursor: industry ? "pointer" : "not-allowed", opacity: industry ? 1 : 0.5 }}
          >
            <option value="">Sub-industry</option>
            {subIndustries.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Row 2: HQ + Known Competitors */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <select
            value={hq} onChange={e => setHq(e.target.value)}
            style={{ flex: 1, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: hq ? "#0f172a" : "#94a3b8", fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="">HQ Country (optional)</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={knownCompetitors} onChange={e => setKnownCompetitors(e.target.value)}
            placeholder="Known competitors (optional, comma-separated domains)"
            style={{ flex: 2, padding: "9px 14px", borderRadius: 9, border: "1px solid #e2e8f0", fontSize: 13.5, color: "#0f172a", fontFamily: "inherit", outline: "none", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Row 3: Target Geography + Submit */}
        <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginRight: 4 }}>Geography:</span>
            {TARGET_GEOGRAPHIES.map(geo => (
              <button
                key={geo}
                onClick={() => toggleGeo(geo)}
                style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: targetGeo.includes(geo) ? 570 : 480,
                  border: `1px solid ${targetGeo.includes(geo) ? "rgba(99,102,241,0.3)" : "#e2e8f0"}`,
                  background: targetGeo.includes(geo) ? "rgba(99,102,241,0.06)" : "#fff",
                  color: targetGeo.includes(geo) ? "#4f46e5" : "#64748b",
                  cursor: "pointer", transition: "all 0.12s ease",
                }}
              >
                {geo}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "9px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 580,
              background: canSubmit ? "linear-gradient(135deg,#4f46e5,#6366f1)" : "#e2e8f0",
              color: canSubmit ? "#fff" : "#94a3b8",
              cursor: canSubmit ? "pointer" : "default",
              boxShadow: canSubmit ? "0 2px 8px rgba(99,102,241,0.25)" : "none",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}
          >
            {analysis.status === "running" ? "\u23F3 Running..." : "\u25B6 Run Analysis"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {(analysis.status !== "idle") && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8ecf1", background: "#fff" }}>
          {(["activity", "report"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 480,
                color: activeTab === tab ? "#4f46e5" : "#94a3b8",
                borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
              }}
            >
              {tab === "activity" ? "Activity Log" : "Report"}
              {tab === "report" && !analysis.summary && (
                <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>(pending)</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {analysis.status === "idle" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1F50D;</div>
              <div style={{ fontSize: 15, fontWeight: 550, color: "#64748b" }}>Enter a domain to begin analysis</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Select an industry and sub-industry, then run the analysis</div>
            </div>
          </div>
        )}

        {activeTab === "activity" && analysis.status !== "idle" && (
          <div ref={eventLogRef} style={{ padding: "16px 28px" }}>
            {analysis.events.map((event, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: agentColors[event.agent || ""] || "#94a3b8", flexShrink: 0, marginTop: 4 }} />
                <span style={{ fontSize: 11, fontWeight: 560, color: agentColors[event.agent || ""] || "#94a3b8", minWidth: 80 }}>{event.agent}</span>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 520 }}>{event.step}</span>
                {event.detail && <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{event.detail}</span>}
              </div>
            ))}
            {analysis.status === "running" && (
              <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 520 }}>Processing...</span>
              </div>
            )}
            {analysis.error && (
              <div style={{ padding: "12px 16px", marginTop: 8, borderRadius: 10, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626", fontSize: 13 }}>
                Error: {analysis.error}
              </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {activeTab === "report" && (
          <div style={{ padding: "24px 28px" }}>
            {analysis.summary ? (
              <>
                {analysis.profile && (
                  <div style={{ marginBottom: 24, padding: "16px 20px", borderRadius: 12, background: "#fff", border: "1px solid #e8ecf1" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 640, color: "#0f172a", margin: 0 }}>{analysis.profile.name}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{analysis.profile.description}</p>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                      <span>{analysis.profile.industry} / {analysis.profile.subIndustry}</span>
                      {analysis.profile.hq && <span>HQ: {analysis.profile.hq}</span>}
                    </div>
                  </div>
                )}

                <ReportSummarySection summary={analysis.summary} />

                {analysis.competitors.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 640, color: "#0f172a", marginBottom: 16 }}>Competitor Deep Dives</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {analysis.competitors.map((comp, i) => (
                        <CompetitorCardComponent key={i} competitor={comp} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>&#x1F4CA;</div>
                <div style={{ fontSize: 14, fontWeight: 550, color: "#64748b" }}>Report will appear here when analysis completes</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
