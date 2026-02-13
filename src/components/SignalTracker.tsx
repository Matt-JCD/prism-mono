"use client";

import { useState, useMemo } from "react";
import { SIGNAL_TYPES, SEVERITY, TIER_STYLES, TREND_DATA, GRADIENTS, type Account, type Signal, type SignalType } from "@/lib/data";

const getGradient = (id: string): [string, string] =>
  GRADIENTS[String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];

/* ---- Sub-components ---- */

function StatCard({ icon, label, value, change, color, bg, active, onClick }: {
  icon: string; label: string; value: string | number; change?: number; color: string; bg: string; active: boolean; onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flex: 1, minWidth: 0, padding: "16px 18px", borderRadius: 14, border: `1.5px solid ${active ? color + "30" : h ? "#e2e8f0" : "#f1f5f9"}`,
        background: active ? bg : h ? "#fafbfc" : "#fff", cursor: "pointer", textAlign: "left",
        boxShadow: active ? `0 2px 12px -2px ${color}18` : "0 1px 3px -1px rgba(0,0,0,0.04)",
        transition: "all 0.15s ease", display: "flex", flexDirection: "column", gap: 8,
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {change != null && <span style={{ fontSize: 11, fontWeight: 600, color: change > 0 ? "#059669" : "#94a3b8", background: change > 0 ? "rgba(5,150,105,0.06)" : "rgba(100,116,139,0.06)", padding: "2px 7px", borderRadius: 5 }}>{change > 0 ? "+" : ""}{change}%</span>}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", marginTop: 4 }}>{label}</div>
      </div>
    </button>
  );
}

function TrendChart({ data }: { data: { week: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count));
  const h = 100;
  return (
    <div style={{ padding: "20px 24px", background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px -1px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 620, color: "#0f172a", letterSpacing: "-0.01em" }}>Signal Trend</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Last 6 weeks across all accounts</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "rgba(5,150,105,0.06)", padding: "3px 8px", borderRadius: 5 }}>+36% vs prior</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: h }}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / max) * h * 0.85, 4);
          const isLast = i === data.length - 1;
          return (
            <div key={d.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{d.count}</span>
              <div style={{
                width: "100%", height: barH, borderRadius: 6,
                background: isLast ? "linear-gradient(180deg, #6366f1, #818cf8)" : "linear-gradient(180deg, #e2e8f0, #f1f5f9)",
                boxShadow: isLast ? "0 2px 8px rgba(99,102,241,0.2)" : "none",
                transition: "height 0.3s ease",
              }} />
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{d.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountLeaderboard({ accounts, signals }: { accounts: Account[]; signals: Signal[] }) {
  const ranked = useMemo(() => {
    return accounts.map(a => {
      const acctSignals = signals.filter(s => s.accountId === a.id);
      const highCount = acctSignals.filter(s => s.severity === "high").length;
      return { ...a, signalCount: acctSignals.length, highCount, recentSignal: acctSignals[0] };
    }).sort((a, b) => b.signalCount - a.signalCount);
  }, [accounts, signals]);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px -1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px" }}>
        <div style={{ fontSize: 14, fontWeight: 620, color: "#0f172a", letterSpacing: "-0.01em" }}>Accounts by Signal Activity</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Last 30 days</div>
      </div>
      {ranked.map((a, i) => {
        const [g1, g2] = getGradient(a.id);
        const ts = TIER_STYLES[a.tier];
        const maxCount = ranked[0].signalCount;
        const barW = maxCount > 0 ? (a.signalCount / maxCount) * 100 : 0;
        return (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderTop: i > 0 ? "1px solid #f8fafc" : "none" }}>
            <span style={{ fontSize: 12, fontWeight: 650, color: "#94a3b8", width: 18, textAlign: "center" }}>{i + 1}</span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 650, flexShrink: 0 }}>{a.logo}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 580, color: "#0f172a" }}>{a.name}</span>
                <span style={{ fontSize: 10, fontWeight: 550, padding: "1px 6px", borderRadius: 4, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>{a.tier}</span>
              </div>
              <div style={{ marginTop: 5, height: 4, borderRadius: 2, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${barW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${g1}, ${g2})`, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 680, color: "#0f172a" }}>{a.signalCount}</div>
              {a.highCount > 0 && <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 560 }}>{a.highCount} high</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SignalCard({ signal, account, signalType, onToggleRead }: { signal: Signal; account: Account | undefined; signalType: SignalType | undefined; onToggleRead: (id: string) => void }) {
  const [h, setH] = useState(false);
  const [g1, g2] = getGradient(account?.id || "x");
  const sev = SEVERITY[signal.severity];
  if (!signalType) return null;

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "16px 20px", borderRadius: 12,
        border: `1px solid ${!signal.read ? "rgba(99,102,241,0.15)" : h ? "#e2e8f0" : "#f1f5f9"}`,
        background: !signal.read ? "rgba(99,102,241,0.02)" : h ? "#fafbfc" : "#fff",
        boxShadow: h ? "0 4px 16px -4px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)",
        transition: "all 0.15s ease", cursor: "pointer",
      }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: signalType.bg, border: `1px solid ${signalType.color}15`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>{signalType.icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {!signal.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />}
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>{signal.title}</span>
            <span style={{ fontSize: 10.5, fontWeight: 550, padding: "2px 7px", borderRadius: 5, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 660 }}>{account?.logo}</div>
              <span style={{ fontSize: 12, fontWeight: 540, color: "#475569" }}>{account?.name}</span>
            </div>
            <span style={{ color: "#e2e8f0" }}>·</span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{signal.source}</span>
            <span style={{ color: "#e2e8f0" }}>·</span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{signal.timestamp}</span>
          </div>

          <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.55, marginTop: 8, margin: "8px 0 0" }}>{signal.summary}</p>

          {h && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {[
                { label: signal.read ? "Mark unread" : "Mark read", onClick: () => onToggleRead(signal.id) },
                { label: "View source" },
                { label: "Create task" },
                { label: "Dismiss", danger: true },
              ].map(a => (
                <button key={a.label} onClick={a.onClick} style={{
                  padding: "4px 10px", borderRadius: 6, border: `1px solid ${a.danger ? "rgba(239,68,68,0.15)" : "#e2e8f0"}`,
                  background: a.danger ? "rgba(239,68,68,0.04)" : "#fff",
                  color: a.danger ? "#dc2626" : "#64748b",
                  fontSize: 11, fontWeight: 520, cursor: "pointer",
                }}>{a.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 12px", borderRadius: 8, border: `1px solid ${active ? "rgba(99,102,241,0.2)" : h ? "#e2e8f0" : "#f1f5f9"}`,
        background: active ? "rgba(99,102,241,0.06)" : h ? "#fafbfc" : "#fff",
        color: active ? "#4f46e5" : "#64748b", fontSize: 12, fontWeight: active ? 570 : 480,
        cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.12s ease", whiteSpace: "nowrap",
      }}>
      {label}
      {count != null && <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#6366f1" : "#94a3b8", background: active ? "rgba(99,102,241,0.08)" : "rgba(100,116,139,0.06)", padding: "1px 5px", borderRadius: 4 }}>{count}</span>}
    </button>
  );
}

/* ---- Main Export ---- */

export default function SignalTracker({ accounts, signals, onToggleRead }: { accounts: Account[]; signals: Signal[]; onToggleRead: (id: string) => void }) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [accountFilter, setAccountFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return signals.filter(s => {
      if (typeFilter && s.type !== typeFilter) return false;
      if (severityFilter && s.severity !== severityFilter) return false;
      if (accountFilter && s.accountId !== accountFilter) return false;
      return true;
    });
  }, [signals, typeFilter, severityFilter, accountFilter]);

  const unreadCount = signals.filter(s => !s.read).length;
  const highCount = signals.filter(s => s.severity === "high").length;

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    SIGNAL_TYPES.forEach(t => c[t.id] = signals.filter(s => s.type === t.id).length);
    return c;
  }, [signals]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid #e8ecf1", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 680, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>Signal Tracker</h1>
              {unreadCount > 0 && <span style={{ fontSize: 11, fontWeight: 620, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>{unreadCount} new</span>}
            </div>
            <p style={{ fontSize: 13.5, color: "#64748b", marginTop: 4, margin: "4px 0 0" }}>Buying signals across {accounts.length} tracked accounts</p>
          </div>
          <button style={{
            padding: "8px 18px", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            color: "#fff", fontSize: 12.5, fontWeight: 580, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{"\u2699\uFE0F"}</span> Configure Signals
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 32px 40px" }}>
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <StatCard icon="\u{1F4CA}" label="Total Signals" value={signals.length} change={36} color="#6366f1" bg="rgba(99,102,241,0.05)"
            active={!typeFilter && !severityFilter} onClick={() => { setTypeFilter(null); setSeverityFilter(null); }} />
          <StatCard icon="\u{1F534}" label="High Severity" value={highCount} color="#ef4444" bg="rgba(239,68,68,0.04)"
            active={severityFilter === "high"} onClick={() => setSeverityFilter(severityFilter === "high" ? null : "high")} />
          <StatCard icon="\u{1F195}" label="Unread" value={unreadCount} color="#6366f1" bg="rgba(99,102,241,0.04)"
            active={false} onClick={() => {}} />
          <StatCard icon="\u{1F3E2}" label="Active Accounts" value={accounts.filter(a => signals.some(s => s.accountId === a.id)).length + "/" + accounts.length} color="#059669" bg="rgba(5,150,105,0.04)"
            active={false} onClick={() => {}} />
        </div>

        {/* Middle row: Trend + Leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <TrendChart data={TREND_DATA} />
          <AccountLeaderboard accounts={accounts} signals={signals} />
        </div>

        {/* Signal Feed */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 640, color: "#0f172a", letterSpacing: "-0.02em" }}>Signal Feed</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 6 }}>Showing {filtered.length} of {signals.length}</span>
              {(typeFilter || severityFilter || accountFilter) && (
                <button onClick={() => { setTypeFilter(null); setSeverityFilter(null); setAccountFilter(null); }}
                  style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, fontWeight: 520, cursor: "pointer" }}>Clear filters</button>
              )}
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <FilterPill label="All" active={!typeFilter} count={signals.length} onClick={() => setTypeFilter(null)} />
            {SIGNAL_TYPES.map(st => (
              <FilterPill key={st.id} label={`${st.icon} ${st.label}`} active={typeFilter === st.id}
                count={typeCounts[st.id]} onClick={() => setTypeFilter(typeFilter === st.id ? null : st.id)} />
            ))}
          </div>

          {/* Account filter row */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <FilterPill label="All accounts" active={!accountFilter} onClick={() => setAccountFilter(null)} />
            {accounts.map(a => (
              <FilterPill key={a.id} label={a.name} active={accountFilter === a.id}
                count={signals.filter(s => s.accountId === a.id).length}
                onClick={() => setAccountFilter(accountFilter === a.id ? null : a.id)} />
            ))}
          </div>

          {/* Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length > 0 ? filtered.map(s => {
              const account = accounts.find(a => a.id === s.accountId);
              const signalType = SIGNAL_TYPES.find(t => t.id === s.type);
              return <SignalCard key={s.id} signal={s} account={account} signalType={signalType} onToggleRead={onToggleRead} />;
            }) : (
              <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{"\u{1F50D}"}</div>
                <div style={{ fontSize: 14, fontWeight: 550, color: "#64748b" }}>No signals match your filters</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or check back later</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
