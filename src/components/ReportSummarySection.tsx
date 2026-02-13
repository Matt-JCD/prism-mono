"use client";

import type { ReportSummary } from "../../agents/shared/types";
import MarketPositioningMap from "./MarketPositioningMap";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 14, fontWeight: 620, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h4>
      {children}
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 16, listStyle: "disc" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: color || "#475569", lineHeight: 1.55, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

const confidenceColors: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: "rgba(16,185,129,0.06)", color: "#059669", border: "rgba(16,185,129,0.15)" },
  medium: { bg: "rgba(245,158,11,0.06)", color: "#d97706", border: "rgba(245,158,11,0.15)" },
  low: { bg: "rgba(100,116,139,0.06)", color: "#64748b", border: "rgba(100,116,139,0.1)" },
};

export default function ReportSummarySection({ summary }: { summary: ReportSummary }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8ecf1", padding: "20px 24px" }}>
      <h3 style={{ fontSize: 16, fontWeight: 640, color: "#0f172a", margin: "0 0 20px" }}>Strategic Intelligence Report</h3>

      {/* Market Positioning */}
      {summary.marketPositioning && summary.marketPositioning.length > 0 && (
        <Section title="Market Positioning">
          <MarketPositioningMap insights={summary.marketPositioning} />
        </Section>
      )}

      {/* Two-column: Moats + Vulnerabilities */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {summary.competitiveMoats && summary.competitiveMoats.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 620, color: "#059669", marginBottom: 8 }}>Competitive Moats</div>
            <BulletList items={summary.competitiveMoats} />
          </div>
        )}
        {summary.vulnerabilities && summary.vulnerabilities.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 620, color: "#dc2626", marginBottom: 8 }}>Vulnerabilities</div>
            <BulletList items={summary.vulnerabilities} />
          </div>
        )}
      </div>

      {/* GTM Signals */}
      {summary.gtmSignals && (
        <Section title="Go-to-Market Signals">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {summary.gtmSignals.pricing && summary.gtmSignals.pricing.length > 0 && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 620, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Pricing</div>
                <BulletList items={summary.gtmSignals.pricing} />
              </div>
            )}
            {summary.gtmSignals.channels && summary.gtmSignals.channels.length > 0 && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 620, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Channels</div>
                <BulletList items={summary.gtmSignals.channels} />
              </div>
            )}
            {summary.gtmSignals.icp && summary.gtmSignals.icp.length > 0 && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 620, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>ICP</div>
                <BulletList items={summary.gtmSignals.icp} />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Technology Differentiation */}
      {summary.technologyDifferentiation && summary.technologyDifferentiation.length > 0 && (
        <Section title="Technology Differentiation">
          <BulletList items={summary.technologyDifferentiation} />
        </Section>
      )}

      {/* Strategic Recommendations */}
      {summary.strategicRecommendations && summary.strategicRecommendations.length > 0 && (
        <Section title="Strategic Recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {summary.strategicRecommendations.map((rec, i) => {
              const cc = confidenceColors[rec.confidence] || confidenceColors.medium;
              return (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: "#fff", border: "1px solid #e8ecf1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 580, color: "#0f172a" }}>{rec.recommendation}</span>
                    <span style={{ fontSize: 10, fontWeight: 560, padding: "2px 6px", borderRadius: 4, background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{rec.confidence}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{rec.rationale}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Risks & Opportunities */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {summary.risks && summary.risks.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 620, color: "#d97706", marginBottom: 8 }}>Risks to Monitor</div>
            <BulletList items={summary.risks} />
          </div>
        )}
        {summary.opportunities && summary.opportunities.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 620, color: "#2563eb", marginBottom: 8 }}>Opportunities to Pursue</div>
            <BulletList items={summary.opportunities} />
          </div>
        )}
      </div>
    </div>
  );
}
