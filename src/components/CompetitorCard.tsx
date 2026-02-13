"use client";

import { useState } from "react";
import type { CompetitorCard as CompetitorCardType } from "../../agents/shared/types";
import SwotGrid from "./SwotGrid";

const threatColors: Record<string, { bg: string; color: string; border: string }> = {
  Direct: { bg: "rgba(239,68,68,0.06)", color: "#dc2626", border: "rgba(239,68,68,0.15)" },
  Adjacent: { bg: "rgba(245,158,11,0.06)", color: "#d97706", border: "rgba(245,158,11,0.15)" },
  Emerging: { bg: "rgba(59,130,246,0.06)", color: "#2563eb", border: "rgba(59,130,246,0.15)" },
};

export default function CompetitorCardComponent({ competitor }: { competitor: CompetitorCardType }) {
  const [expanded, setExpanded] = useState(false);
  const tc = threatColors[competitor.threatLevel] || threatColors.Direct;

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8ecf1", overflow: "hidden", boxShadow: "0 1px 3px -1px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 620, color: "#0f172a" }}>{competitor.name}</span>
            <span style={{ fontSize: 10.5, fontWeight: 560, padding: "2px 8px", borderRadius: 5, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
              {competitor.threatLevel}
            </span>
            {competitor.confidenceScore != null && (
              <span style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500 }}>
                {Math.round(competitor.confidenceScore * 100)}% confidence
              </span>
            )}
          </div>
          {competitor.description && (
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, margin: "4px 0 0" }}>{competitor.description}</p>
          )}
        </div>
        <span style={{ color: "#94a3b8", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
            {[
              { label: "Domain", value: competitor.domain },
              { label: "Founded", value: competitor.founded },
              { label: "HQ", value: competitor.hq },
              { label: "Team Size", value: competitor.teamSize },
            ].map(item => item.value ? (
              <div key={item.label}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 520, color: "#0f172a", marginTop: 2 }}>{item.value}</div>
              </div>
            ) : null)}
          </div>

          {/* What They Do */}
          {competitor.whatTheyDo && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 4 }}>What They Do</div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, margin: 0 }}>{competitor.whatTheyDo}</p>
            </div>
          )}

          {/* Funding */}
          {competitor.funding && (competitor.funding.round || competitor.funding.amount) && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 8 }}>Funding</div>
              <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                {competitor.funding.round && <span><strong style={{ color: "#0f172a" }}>Round:</strong> <span style={{ color: "#64748b" }}>{competitor.funding.round}</span></span>}
                {competitor.funding.amount && <span><strong style={{ color: "#0f172a" }}>Amount:</strong> <span style={{ color: "#64748b" }}>{competitor.funding.amount}</span></span>}
                {competitor.funding.date && <span><strong style={{ color: "#0f172a" }}>Date:</strong> <span style={{ color: "#64748b" }}>{competitor.funding.date}</span></span>}
              </div>
              {competitor.funding.investors && competitor.funding.investors.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                  Investors: {competitor.funding.investors.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Key Leaders */}
          {competitor.keyLeaders && competitor.keyLeaders.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 8 }}>Key Leaders</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {competitor.keyLeaders.map((leader, i) => (
                  <div key={i} style={{ padding: "6px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: 12 }}>
                    <span style={{ fontWeight: 580, color: "#0f172a" }}>{leader.name}</span>
                    <span style={{ color: "#94a3b8", marginLeft: 6 }}>{leader.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SWOT */}
          {competitor.swot && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 8 }}>SWOT Analysis</div>
              <SwotGrid swot={competitor.swot} />
            </div>
          )}

          {/* Recent Moves */}
          {competitor.recentMoves && competitor.recentMoves.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 8 }}>Recent Moves</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {competitor.recentMoves.map((move, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 550, minWidth: 70 }}>{move.date}</span>
                    <span style={{ fontSize: 12.5, color: "#475569" }}>{move.description}</span>
                    {move.source && <span style={{ fontSize: 11, color: "#cbd5e1", marginLeft: "auto" }}>{move.source}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
