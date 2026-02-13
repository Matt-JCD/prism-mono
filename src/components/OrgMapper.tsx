"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { TIER_STYLES, T, getGradient, getInitials, getTagStyle, type Account, type Person } from "@/lib/data";

/* ---- SVG icon helper ---- */
const I = ({ children, s = 18 }: { children: React.ReactNode; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const ic = {
  search: <I s={15}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></I>,
  linkedIn: <I s={13}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></I>,
  mail: <I s={13}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></I>,
  zap: <I s={14}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></I>,
  globe: <I s={12}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></I>,
  users: <I s={13}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>,
  chevRight: <I s={14}><path d="m9 18 6-6-6-6"/></I>,
  back: <I s={16}><path d="m15 18-6-6 6-6"/></I>,
  chevDown: <I s={13}><path d="m6 9 6 6 6-6"/></I>,
  mapPin: <I s={13}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>,
  building: <I s={13}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></I>,
  calendar: <I s={13}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>,
  dollar: <I s={13}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></I>,
  filter: <I s={14}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></I>,
  externalLink: <I s={12}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></I>,
  edit: <I s={13}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></I>,
  check: <I s={14}><polyline points="20 6 9 17 4 12"/></I>,
  x: <I s={14}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>,
  plus: <I s={15}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>,
  trash: <I s={13}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></I>,
  userPlus: <I s={16}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></I>,
};

/* ---- Shared sub-components ---- */

function Dropdown({ trigger, children, align = "left" }: { trigger: (open: boolean) => React.ReactNode; children: (close: () => void) => React.ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger(open)}</div>
      {open && <div style={{ position: "absolute", top: "calc(100% + 4px)", [align]: 0, minWidth: 200, background: "#fff", borderRadius: 10, border: "1px solid #e8ecf1", boxShadow: "0 8px 30px -4px rgba(0,0,0,0.1), 0 2px 8px -2px rgba(0,0,0,0.04)", zIndex: 50, padding: 4 }}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

function DropdownItem({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number | null }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: "100%", padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: h ? "#f8fafc" : "transparent", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 15, height: 15, borderRadius: 4, border: active ? "none" : "1.5px solid #d1d5db", background: active ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 1px 4px rgba(99,102,241,0.2)" : "none" }}>{active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
      <span style={{ fontSize: 13, fontWeight: active ? 530 : 440, color: active ? "#0f172a" : "#64748b", flex: 1 }}>{label}</span>
      {count != null && <span style={{ fontSize: 11, color: "#94a3b8" }}>{count}</span>}
    </button>
  );
}

function MetaItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ color: "#94a3b8", display: "flex" }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#475569", fontWeight: 530 }}>{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", fontFamily: "inherit", outline: "none", background: "#f8fafc" }} onFocus={e => e.target.style.borderColor = "#a5b4fc"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
    </div>
  );
}

/* ---- PersonCard ---- */

function PersonCard({ person, style: posStyle, hovered, onMouseEnter, onMouseLeave, onUpdate, onDelete }: {
  person: Person; style: React.CSSProperties; hovered: string | null;
  onMouseEnter: (id: string) => void; onMouseLeave: () => void;
  onUpdate: (id: string, updates: Partial<Person>) => void; onDelete: (id: string) => void;
}) {
  const [g1, g2] = getGradient(person.id);
  const isH = hovered === person.id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: person.name, role: person.role, department: person.department, tags: person.tags.join(", "), linkedinUrl: person.linkedinUrl || "" });

  useEffect(() => {
    setDraft({ name: person.name, role: person.role, department: person.department, tags: person.tags.join(", "), linkedinUrl: person.linkedinUrl || "" });
  }, [person]);

  const handleSave = () => {
    onUpdate(person.id, { name: draft.name, role: draft.role, department: draft.department, tags: draft.tags.split(",").map(t => t.trim()).filter(Boolean), linkedinUrl: draft.linkedinUrl });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({ name: person.name, role: person.role, department: person.department, tags: person.tags.join(", "), linkedinUrl: person.linkedinUrl || "" });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ position: "absolute", ...posStyle, width: 300, background: "#fff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 8px 30px -4px rgba(99,102,241,0.15), 0 2px 8px -2px rgba(0,0,0,0.06)", zIndex: 20 }}>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 620 }}>{getInitials(draft.name)}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>Edit Contact</span>
            </div>
            <button onClick={handleCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4, borderRadius: 6 }}>{ic.x}</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <EditField label="Name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
            <EditField label="Role" value={draft.role} onChange={v => setDraft({ ...draft, role: v })} />
            <EditField label="Department" value={draft.department} onChange={v => setDraft({ ...draft, department: v })} />
            <EditField label="Tags (comma separated)" value={draft.tags} onChange={v => setDraft({ ...draft, tags: v })} />
            <EditField label="LinkedIn URL" value={draft.linkedinUrl} onChange={v => setDraft({ ...draft, linkedinUrl: v })} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14, justifyContent: "space-between" }}>
            <button onClick={() => { onDelete(person.id); setEditing(false); }} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 12, fontWeight: 530, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>{ic.trash} Remove</button>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleCancel} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 530, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", fontSize: 12, fontWeight: 580, cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 5 }}>{ic.check} Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vis = person.tags.slice(0, 2), extra = person.tags.length - 2;
  return (
    <div onMouseEnter={() => onMouseEnter(person.id)} onMouseLeave={onMouseLeave}
      style={{ position: "absolute", ...posStyle, width: 300, background: "#fff", borderRadius: 14, border: `1px solid ${isH ? "rgba(99,102,241,0.3)" : "rgba(226,232,240,0.8)"}`, boxShadow: isH ? T.card.shadowHover : T.card.shadow, transform: isH ? "translateY(-3px)" : "translateY(0)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer", zIndex: isH ? 10 : 1 }}>
      <div style={{ padding: "16px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 620, letterSpacing: "-0.02em", boxShadow: `0 2px 8px -2px ${g1}40` }}>{getInitials(person.name)}</div>
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: person.active ? "#10b981" : "#94a3b8", border: "2.5px solid #fff", boxShadow: person.active ? "0 0 6px rgba(16,185,129,0.35)" : "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</div>
            <div style={{ fontSize: 12, fontWeight: 480, color: "#64748b", marginTop: 1.5 }}>{person.role}</div>
          </div>
          <div style={{ display: "flex", gap: 1, marginTop: 1 }}>
            <button onClick={e => { e.stopPropagation(); setEditing(true); }} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: isH ? "rgba(99,102,241,0.07)" : "transparent", color: isH ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s ease" }}>{ic.edit}</button>
            {[ic.linkedIn, ic.mail].map((icon, i) => (
              <button key={i} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: isH ? "rgba(99,102,241,0.07)" : "transparent", color: isH ? "#6366f1" : "#b0b8c4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s ease" }}>{icon}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
          {vis.map((tag, i) => { const s = getTagStyle(tag); return <span key={i} style={{ fontSize: 11, fontWeight: 520, padding: "2.5px 8px", borderRadius: 5.5, background: s.bg, color: s.color, border: `1px solid ${s.border}`, lineHeight: 1.45 }}>{tag}</span>; })}
          {extra > 0 && <span style={{ fontSize: 11, fontWeight: 520, padding: "2.5px 7px", borderRadius: 5.5, background: "rgba(100,116,139,0.05)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.08)" }}>+{extra}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---- AddPersonModal ---- */

function AddPersonModal({ departments, people, onAdd, onClose }: { departments: string[]; people: Person[]; onAdd: (p: Person) => void; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: "", role: "", department: departments[0] || "Leadership", tags: "", linkedinUrl: "", parentId: "" });
  const handleAdd = () => {
    if (!draft.name.trim()) return;
    const parent = people.find(p => p.id === draft.parentId);
    onAdd({ id: "new-" + Date.now(), name: draft.name, role: draft.role, department: draft.department, tags: draft.tags.split(",").map(t => t.trim()).filter(Boolean), linkedinUrl: draft.linkedinUrl, active: true, parentId: draft.parentId || null, level: parent ? parent.level + 1 : 0 });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px -12px rgba(0,0,0,0.15), 0 4px 20px -4px rgba(0,0,0,0.08)", border: "1px solid #e8ecf1" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#6366f1", display: "flex" }}>{ic.userPlus}</span>
            <span style={{ fontSize: 16, fontWeight: 640, color: "#0f172a", letterSpacing: "-0.02em" }}>Add Contact</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4, borderRadius: 6 }}>{ic.x}</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EditField label="Name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
          <EditField label="Role / Title" value={draft.role} onChange={v => setDraft({ ...draft, role: v })} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Department</label>
            <select value={draft.department} onChange={e => setDraft({ ...draft, department: e.target.value })} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", fontFamily: "inherit", background: "#f8fafc", outline: "none" }}>
              <option value="Leadership">Leadership</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Reports to</label>
            <select value={draft.parentId} onChange={e => setDraft({ ...draft, parentId: e.target.value })} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", fontFamily: "inherit", background: "#f8fafc", outline: "none" }}>
              <option value="">None (top level)</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
            </select>
          </div>
          <EditField label="Tags (comma separated)" value={draft.tags} onChange={v => setDraft({ ...draft, tags: v })} />
          <EditField label="LinkedIn URL" value={draft.linkedinUrl} onChange={v => setDraft({ ...draft, linkedinUrl: v })} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 530, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleAdd} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: draft.name.trim() ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "#e2e8f0", color: draft.name.trim() ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 590, cursor: draft.name.trim() ? "pointer" : "default", boxShadow: draft.name.trim() ? "0 2px 8px rgba(99,102,241,0.25)" : "none", display: "flex", alignItems: "center", gap: 6 }}>{ic.plus} Add Contact</button>
        </div>
      </div>
    </div>
  );
}

/* ---- AccountList ---- */

function AccountList({ accounts, onSelect }: { accounts: Account[]; onSelect: (a: Account) => void }) {
  const [search, setSearch] = useState("");
  const [hovId, setHovId] = useState<string | null>(null);
  const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.industry.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid #e8ecf1" }}>
        <h1 style={{ fontSize: 22, fontWeight: 680, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>Accounts</h1>
        <p style={{ fontSize: 13.5, color: "#64748b", marginTop: 4 }}>{accounts.length} companies tracked</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <span style={{ color: "#94a3b8", display: "flex" }}>{ic.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." style={{ border: "none", outline: "none", fontSize: 13, color: "#0f172a", flex: 1, background: "transparent", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 40px", padding: "10px 32px", borderBottom: "1px solid #f1f5f9", gap: 12 }}>
        {["Company", "Industry", "Tier", "Contacts", "Updated", ""].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</span>)}
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {filtered.map(account => {
          const isH = hovId === account.id, tier = TIER_STYLES[account.tier] || TIER_STYLES.Prospect, [g1, g2] = getGradient(account.id);
          return (
            <div key={account.id} onMouseEnter={() => setHovId(account.id)} onMouseLeave={() => setHovId(null)} onClick={() => onSelect(account)}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 40px", padding: "14px 32px", gap: 12, alignItems: "center", cursor: "pointer", background: isH ? "rgba(99,102,241,0.03)" : "transparent", borderBottom: "1px solid #f8fafc", transition: "background 0.1s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 650, boxShadow: `0 2px 6px -2px ${g1}35` }}>{account.logo}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 590, color: "#0f172a" }}>{account.name}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "flex" }}>{ic.globe}</span> {account.website}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "#64748b" }}>{account.industry}</span>
              <span style={{ fontSize: 11, fontWeight: 550, padding: "3px 9px", borderRadius: 6, background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`, justifySelf: "start" }}>{account.tier}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "flex", color: "#94a3b8" }}>{ic.users}</span><span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{(account.people || []).length}</span></div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{account.lastUpdated}</span>
              <span style={{ color: isH ? "#6366f1" : "#d1d5db", display: "flex", transition: "color 0.1s ease" }}>{ic.chevRight}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- OrgChartView ---- */

function OrgChartView({ account, onBack, onUpdateAccount }: { account: Account; onBack: () => void; onUpdateAccount: (a: Account) => void }) {
  const [hovCard, setHovCard] = useState<string | null>(null);
  const [selDepts, setSelDepts] = useState(new Set(account.departments || []));
  const [zoom, setZoom] = useState(1);
  const [actFilt, setActFilt] = useState(false);
  const [resFilt, setResFilt] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const allPeople = account.people || [];
  const people = allPeople.filter(p => p.department === "Leadership" || selDepts.has(p.department));
  const toggleDept = (d: string) => setSelDepts(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n; });
  const activeDeptCount = selDepts.size;
  const totalDeptCount = (account.departments || []).length;

  const handleUpdatePerson = (personId: string, updates: Partial<Person>) => {
    onUpdateAccount({ ...account, people: allPeople.map(p => p.id === personId ? { ...p, ...updates } : p) });
  };
  const handleDeletePerson = (personId: string) => {
    onUpdateAccount({ ...account, people: allPeople.filter(p => p.id !== personId).map(p => p.parentId === personId ? { ...p, parentId: null } : p) });
  };
  const handleAddPerson = (person: Person) => {
    onUpdateAccount({ ...account, people: [...allPeople, person] });
  };

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {}, CW = 300, HG = 48, VG = 100, levels: Record<number, Person[]> = {};
    people.forEach(p => { if (!levels[p.level]) levels[p.level] = []; levels[p.level].push(p); });
    Object.keys(levels).forEach(lv => {
      const l = parseInt(lv), row = levels[l], tw = row.length * CW + (row.length - 1) * HG, sx = -tw / 2 + CW / 2;
      row.forEach((p, i) => { pos[p.id] = { x: sx + i * (CW + HG), y: l * (120 + VG) }; });
    });
    return pos;
  }, [people]);

  const cc = useMemo(() => {
    const xs = Object.values(positions).map(p => p.x);
    return xs.length ? { x: -(Math.min(...xs) + Math.max(...xs)) / 2, y: 40 } : { x: 0, y: 0 };
  }, [positions]);

  const edges = people.filter(p => p.parentId && positions[p.parentId] && positions[p.id]).map(p => {
    const f = positions[p.parentId!], t = positions[p.id];
    const fX = f.x + 150, fY = f.y + 88, tX = t.x + 150, tY = t.y, mY = (fY + tY) / 2;
    return { id: `${p.parentId}-${p.id}`, d: `M ${fX} ${fY} C ${fX} ${mY}, ${tX} ${mY}, ${tX} ${tY}` };
  });

  const [g1, g2] = getGradient(account.id);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #e8ecf1", background: "#fff" }}>
        <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, fontWeight: 500, padding: "4px 8px", borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{ic.back} Accounts</button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 660, boxShadow: `0 2px 6px -2px ${g1}35` }}>{account.logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 650, color: "#0f172a", letterSpacing: "-0.02em" }}>{account.name}</span>
              {(() => { const ts = TIER_STYLES[account.tier]; return <span style={{ fontSize: 10.5, fontWeight: 560, padding: "2px 8px", borderRadius: 5, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>{account.tier}</span>; })()}
              {account.linkedin && <a href={account.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", display: "flex", padding: 2, borderRadius: 4 }}>{ic.externalLink}</a>}
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 520, color: "#475569" }}>{ic.userPlus} Add Person</button>
          <Dropdown trigger={(open) => (<button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: open ? "#f8fafc" : "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 520, color: "#475569" }}>{ic.filter} Departments <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", background: "rgba(99,102,241,0.08)", padding: "1px 5px", borderRadius: 4 }}>{activeDeptCount}/{totalDeptCount}</span> {ic.chevDown}</button>)} align="right">
            {() => (<>
              <div style={{ padding: "6px 12px 4px" }}><span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Filter departments</span></div>
              {(account.departments || []).map(dept => <DropdownItem key={dept} label={dept} active={selDepts.has(dept)} count={allPeople.filter(p => p.department === dept).length} onClick={() => toggleDept(dept)} />)}
              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 4 }}>
                <DropdownItem label={activeDeptCount === totalDeptCount ? "Deselect all" : "Select all"} active={false} onClick={() => { if (activeDeptCount === totalDeptCount) setSelDepts(new Set()); else setSelDepts(new Set(account.departments)); }} />
              </div>
            </>)}
          </Dropdown>
          <button style={{ padding: "7px 16px", borderRadius: 8, background: "linear-gradient(135deg, #4f46e5, #6366f1)", border: "none", color: "#fff", fontSize: 12.5, fontWeight: 580, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.12)" }}>{ic.zap} Scrape</button>
        </div>
        <div style={{ padding: "10px 24px 14px", marginLeft: 84, display: "flex", gap: 20, alignItems: "center" }}>
          <MetaItem icon={ic.mapPin} value={account.hq} />
          <span style={{ color: "#e2e8f0" }}>·</span>
          <MetaItem icon={ic.users} value={`${account.employees} employees`} />
          <span style={{ color: "#e2e8f0" }}>·</span>
          <MetaItem icon={ic.building} value={account.industry} />
          <span style={{ color: "#e2e8f0" }}>·</span>
          <MetaItem icon={ic.dollar} value={account.revenue} />
          {account.founded && <>
            <span style={{ color: "#e2e8f0" }}>·</span>
            <MetaItem icon={ic.calendar} value={`Founded ${account.founded}`} />
          </>}
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.015) 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}><defs><pattern id="dg" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.65" fill="#cbd5e1" /></pattern></defs><rect width="100%" height="100%" fill="url(#dg)" /></svg>

        {people.length > 0 ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40 }}>
            <div style={{ position: "relative", transform: `translate(${cc.x}px, ${cc.y}px) scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.3s ease" }}>
              <svg style={{ position: "absolute", top: -200, left: -800, width: 2000, height: 1200, pointerEvents: "none", overflow: "visible" }}>
                {edges.map(e => <path key={e.id} d={e.d} fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ opacity: 0.55 }} />)}
              </svg>
              {people.map(p => positions[p.id] && (
                <PersonCard key={p.id} person={p} style={{ left: positions[p.id].x, top: positions[p.id].y }}
                  hovered={hovCard} onMouseEnter={setHovCard} onMouseLeave={() => setHovCard(null)}
                  onUpdate={handleUpdatePerson} onDelete={handleDeletePerson} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 550, color: "#64748b" }}>No contacts mapped yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Run the scraper or add people manually to map {account.name}</div>
              <button onClick={() => setShowAddModal(true)} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", fontSize: 13, fontWeight: 580, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.25)", display: "inline-flex", alignItems: "center", gap: 6 }}>{ic.userPlus} Add First Contact</button>
            </div>
          </div>
        )}

        {/* Bottom toggles */}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 18px", borderRadius: 11, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.5)", boxShadow: "0 2px 12px -2px rgba(0,0,0,0.04)" }}>
            {[{ l: "Recent Activity (90d)", s: actFilt, t: () => setActFilt(!actFilt) }, { l: "Topic Resonance", s: resFilt, t: () => setResFilt(!resFilt) }].map(({ l, s, t }) => (
              <button key={l} onClick={t} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 490, color: s ? "#4f46e5" : "#94a3b8" }}>
                {l}
                <div style={{ width: 34, height: 19, borderRadius: 10, padding: 2, background: s ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#e2e8f0", transition: "background 0.2s ease" }}>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", transform: s ? "translateX(15px)" : "translateX(0)", transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zoom */}
        <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", borderRadius: 9, overflow: "hidden", border: "1px solid rgba(226,232,240,0.5)" }}>
          {[{ l: "+", a: () => setZoom(z => Math.min(z + 0.15, 1.5)) }, { l: "\u2212", a: () => setZoom(z => Math.max(z - 0.15, 0.4)) }, { l: "\u2291", a: () => setZoom(1) }].map(({ l, a }) => (
            <button key={l} onClick={a} style={{ width: 34, height: 32, border: "none", background: "transparent", cursor: "pointer", fontSize: 15, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</button>
          ))}
        </div>
      </div>

      {showAddModal && <AddPersonModal departments={account.departments || []} people={allPeople} onAdd={handleAddPerson} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

/* ---- Main Export ---- */

export default function OrgMapper({ accounts, onUpdateAccount }: { accounts: Account[]; onUpdateAccount: (a: Account) => void }) {
  const [selAccountId, setSelAccountId] = useState<string | null>(null);
  const selAccount = selAccountId ? accounts.find(a => a.id === selAccountId) || null : null;

  return (
    <div style={{ height: "100%" }}>
      {!selAccount && <AccountList accounts={accounts} onSelect={a => setSelAccountId(a.id)} />}
      {selAccount && <OrgChartView account={selAccount} onBack={() => setSelAccountId(null)} onUpdateAccount={onUpdateAccount} />}
    </div>
  );
}
