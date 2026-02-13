"use client";

export default function MarketPositioningMap({ insights }: { insights: string[] }) {
  // 2x2 quadrant labels: Leaders, Challengers, Visionaries, Niche Players
  const quadrants = [
    { label: "Challengers", x: 0, y: 0, desc: "Strong execution, limited vision" },
    { label: "Leaders", x: 1, y: 0, desc: "Strong execution + complete vision" },
    { label: "Niche Players", x: 0, y: 1, desc: "Focused on specific segments" },
    { label: "Visionaries", x: 1, y: 1, desc: "Innovative vision, execution gaps" },
  ];

  return (
    <div>
      {/* Quadrant Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        {quadrants.map(q => (
          <div key={q.label} style={{ padding: "20px 16px", background: "#fff", minHeight: 80 }}>
            <div style={{ fontSize: 13, fontWeight: 620, color: "#0f172a", marginBottom: 2 }}>{q.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{q.desc}</div>
          </div>
        ))}
      </div>

      {/* Axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", fontWeight: 550, marginBottom: 16 }}>
        <span>&#x2190; Lower Execution</span>
        <span>Higher Execution &#x2192;</span>
      </div>

      {/* Market Insights */}
      {insights.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 620, color: "#0f172a", marginBottom: 8 }}>Market Landscape Insights</div>
          <ul style={{ margin: 0, paddingLeft: 16, listStyle: "disc" }}>
            {insights.map((insight, i) => (
              <li key={i} style={{ fontSize: 13, color: "#475569", lineHeight: 1.55, marginBottom: 4 }}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
