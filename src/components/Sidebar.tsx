"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "@/lib/DataContext";
import AgentConfigPanel from "./AgentConfigPanel";

/* ---- SVG icon helper ---- */
const I = ({ children, s = 18 }: { children: React.ReactNode; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const icons = {
  orgChart: <I><rect x="9" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="16" width="6" height="6" rx="1.5"/><rect x="16" y="16" width="6" height="6" rx="1.5"/><path d="M12 8v3"/><path d="M5 16v-3h14v3"/></I>,
  intel: <I><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></I>,
  signal: <I><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></I>,
  settings: <I><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>,
};

interface NavItemDef {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: boolean;
}

function NavItem({ href, icon, label, active, badge }: NavItemDef & { active: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} className="relative block" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center transition-all duration-100
        ${active ? "bg-[rgba(99,102,241,0.12)] text-[#a5b4fc]" : hovered ? "bg-[rgba(255,255,255,0.055)] text-[#6b7280]" : "text-[#6b7280]"}`}>
        {icon}
      </div>
      {badge && (
        <div className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-[#6366f1] border-2 border-[#0c0f14]" />
      )}
      {hovered && (
        <div className="absolute left-[54px] top-1/2 -translate-y-1/2 px-[10px] py-[5px] rounded-[7px] whitespace-nowrap bg-[#1e293b] text-[#e2e8f0] text-xs font-medium shadow-lg z-[100] pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { unreadSignalCount } = useData();
  const [showConfig, setShowConfig] = useState(false);
  const [settingsHovered, setSettingsHovered] = useState(false);

  const navItems: NavItemDef[] = [
    { href: "/org-mapper", icon: icons.orgChart, label: "Org Mapper" },
    { href: "/comp-intel", icon: icons.intel, label: "Comp Intel" },
    { href: "/signal-tracker", icon: icons.signal, label: "Signal Tracker", badge: unreadSignalCount > 0 },
  ];

  return (
    <>
      <div className="w-16 shrink-0 bg-[#0c0f14] flex flex-col items-center border-r border-[rgba(255,255,255,0.055)] py-3 select-none">
        {/* Logo */}
        <div className="w-9 h-9 rounded-[10px] mb-5 bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.3)] text-[15px] font-bold text-white cursor-pointer">
          P
        </div>

        {/* Nav icons */}
        <div className="flex flex-col gap-1 items-center">
          {navItems.map(item => (
            <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </div>

        <div className="flex-1" />

        {/* Settings */}
        <div className="flex flex-col gap-1 items-center">
          <div className="relative" onMouseEnter={() => setSettingsHovered(true)} onMouseLeave={() => setSettingsHovered(false)}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center border-none cursor-pointer transition-all duration-100
                ${showConfig ? "bg-[rgba(99,102,241,0.12)] text-[#a5b4fc]" : settingsHovered ? "bg-[rgba(255,255,255,0.055)] text-[#6b7280]" : "text-[#6b7280]"}`}
            >
              {icons.settings}
            </button>
            {settingsHovered && (
              <div className="absolute left-[54px] top-1/2 -translate-y-1/2 px-[10px] py-[5px] rounded-[7px] whitespace-nowrap bg-[#1e293b] text-[#e2e8f0] text-xs font-medium shadow-lg z-[100] pointer-events-none">
                Settings
              </div>
            )}
          </div>

          {/* Profile avatar */}
          <div className="w-[34px] h-[34px] rounded-[9px] mt-1 bg-gradient-to-br from-[#374151] to-[#4b5563] flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
            MJ
          </div>
        </div>
      </div>

      {showConfig && <AgentConfigPanel onClose={() => setShowConfig(false)} />}
    </>
  );
}
