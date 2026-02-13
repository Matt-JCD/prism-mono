"use client";

import type { SwotAnalysis } from "../../agents/shared/types";

const quadrants = [
  { key: "strengths" as const, label: "Strengths", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)", color: "#059669", icon: "S" },
  { key: "weaknesses" as const, label: "Weaknesses", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.12)", color: "#dc2626", icon: "W" },
  { key: "opportunities" as const, label: "Opportunities", bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.12)", color: "#2563eb", icon: "O" },
  { key: "threats" as const, label: "Threats", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)", color: "#d97706", icon: "T" },
];

export default function SwotGrid({ swot }: { swot: SwotAnalysis }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {quadrants.map(q => (
        <div key={q.key} style={{ padding: "12px 14px", borderRadius: 10, background: q.bg, border: `1px solid ${q.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: q.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{q.icon}</div>
            <span style={{ fontSize: 12, fontWeight: 620, color: q.color }}>{q.label}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, listStyle: "disc" }}>
            {(swot[q.key] || []).map((item, i) => (
              <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginBottom: 3 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
