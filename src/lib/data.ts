// ============================================================
// SHARED DATA LAYER
// ============================================================

// --- Types ---

export interface Person {
  id: string;
  name: string;
  role: string;
  department: string;
  tags: string[];
  active: boolean;
  parentId: string | null;
  level: number;
  linkedinUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  tier: "Target" | "Active" | "Prospect";
  linkedin?: string;
  website: string;
  contacts?: number;
  lastUpdated: string;
  logo: string;
  hq: string;
  employees: string;
  founded?: string;
  revenue: string;
  departments: string[];
  people: Person[];
}

export interface Signal {
  id: string;
  type: string;
  accountId: string;
  title: string;
  summary: string;
  severity: "high" | "medium" | "low";
  source: string;
  timestamp: string;
  date: string;
  read: boolean;
  url: string;
}

export interface SignalType {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  icon: string;
  status: "configured" | "idle";
  desc: string;
  apiKeys: string[];
}

export interface ModuleAgentGroup {
  label: string;
  icon: string;
  agents: AgentConfig[];
}

// --- Design Tokens ---

export const TIER_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Target: { bg: "rgba(99,102,241,0.08)", color: "#6366f1", border: "rgba(99,102,241,0.15)" },
  Active: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.15)" },
  Prospect: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.15)" },
};

export const T = {
  nav: { bg: "#0c0f14", border: "rgba(255,255,255,0.055)", hover: "rgba(255,255,255,0.055)", active: "rgba(99,102,241,0.12)", text: { primary: "#e2e8f0", secondary: "#6b7280", accent: "#a5b4fc" } },
  card: { shadow: "0 1px 3px -1px rgba(0,0,0,0.05), 0 2px 8px -2px rgba(0,0,0,0.03)", shadowHover: "0 8px 30px -4px rgba(99,102,241,0.12), 0 2px 8px -2px rgba(0,0,0,0.05)" },
};

export const SEVERITY: Record<string, { label: string; color: string; bg: string; border: string }> = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
  low: { label: "Low", color: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.1)" },
};

export const GRADIENTS: [string, string][] = [
  ["#6366f1","#8b5cf6"],["#0ea5e9","#6366f1"],["#14b8a6","#0ea5e9"],
  ["#f59e0b","#ef4444"],["#ec4899","#8b5cf6"],["#10b981","#14b8a6"],["#f97316","#f59e0b"],
];

// --- Utility Functions ---

export const getGradient = (id: string): [string, string] =>
  GRADIENTS[String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];

export const getInitials = (name: string): string =>
  name ? name.split(" ").map(n => n[0]).join("").slice(0, 2) : "??";

export const getTagStyle = (tag: string) => {
  const t = tag.toLowerCase();
  if (["ai","ai agents","machine learning","ml","neural networks","llms","mlops"].some(k => t.includes(k))) return { bg: "rgba(147,51,234,0.08)", color: "#7c3aed", border: "rgba(147,51,234,0.12)" };
  if (["security","zero trust","cloud security","penetration testing","siem","threat modeling","compliance","soc2","iam"].some(k => t.includes(k))) return { bg: "rgba(234,88,12,0.07)", color: "#c2410c", border: "rgba(234,88,12,0.12)" };
  if (["microservices","enterprise architecture","platform engineering","platform","apis","distributed systems","kubernetes","sre"].some(k => t.includes(k))) return { bg: "rgba(14,165,233,0.07)", color: "#0369a1", border: "rgba(14,165,233,0.12)" };
  if (["leadership","strategy","growth","m&a","fintech"].some(k => t.includes(k))) return { bg: "rgba(20,184,166,0.07)", color: "#0f766e", border: "rgba(20,184,166,0.12)" };
  return { bg: "rgba(100,116,139,0.06)", color: "#475569", border: "rgba(100,116,139,0.1)" };
};

// --- Account Data ---

export const INITIAL_ACCOUNTS: Account[] = [
  { id: "techcorp", name: "TechCorp", industry: "Enterprise Software", tier: "Target", linkedin: "https://linkedin.com/company/techcorp", website: "techcorp.io", contacts: 7, lastUpdated: "2h ago", logo: "TC", hq: "San Francisco, CA", employees: "2,400", founded: "2016", revenue: "$180M ARR",
    departments: ["Security", "AI/ML", "Enterprise Architects", "DevOps", "Cloud Infrastructure"],
    people: [
      { id: "1", name: "Sarah Chen", role: "CEO", department: "Leadership", tags: ["leadership", "strategy", "M&A"], active: true, parentId: null, level: 0, linkedinUrl: "" },
      { id: "2", name: "Marcus Rivera", role: "CTO", department: "AI/ML", tags: ["AI Agents", "platform engineering", "distributed systems"], active: true, parentId: "1", level: 1, linkedinUrl: "" },
      { id: "3", name: "Priya Patel", role: "VP of Security", department: "Security", tags: ["zero trust", "cloud security", "compliance"], active: true, parentId: "2", level: 2, linkedinUrl: "" },
      { id: "4", name: "James O'Brien", role: "Head of AI/ML", department: "AI/ML", tags: ["AI", "machine learning", "LLMs"], active: false, parentId: "2", level: 2, linkedinUrl: "" },
      { id: "5", name: "Aisha Johnson", role: "Enterprise Architect Lead", department: "Enterprise Architects", tags: ["microservices", "enterprise architecture", "APIs"], active: true, parentId: "2", level: 2, linkedinUrl: "" },
      { id: "6", name: "David Kim", role: "Security Engineer", department: "Security", tags: ["penetration testing", "SIEM", "threat modeling"], active: true, parentId: "3", level: 3, linkedinUrl: "" },
      { id: "7", name: "Elena Vasquez", role: "ML Engineer", department: "AI/ML", tags: ["ML", "neural networks", "MLOps"], active: false, parentId: "4", level: 3, linkedinUrl: "" },
    ],
  },
  { id: "meridian", name: "Meridian Financial", industry: "Fintech", tier: "Prospect", linkedin: "https://linkedin.com/company/meridian", website: "meridian.finance", contacts: 3, lastUpdated: "1d ago", logo: "MF", hq: "London, UK", employees: "850", founded: "2019", revenue: "$45M ARR",
    departments: ["Engineering", "Product", "Security", "Data"],
    people: [
      { id: "m1", name: "Tom Wright", role: "CEO", department: "Leadership", tags: ["growth", "fintech"], active: true, parentId: null, level: 0, linkedinUrl: "" },
      { id: "m2", name: "Lisa Park", role: "VP Engineering", department: "Engineering", tags: ["platform", "SRE", "kubernetes"], active: true, parentId: "m1", level: 1, linkedinUrl: "" },
      { id: "m3", name: "Raj Mehta", role: "Head of Security", department: "Security", tags: ["SOC2", "zero trust", "IAM"], active: true, parentId: "m1", level: 1, linkedinUrl: "" },
    ],
  },
  { id: "cencora", name: "Cencora", industry: "Healthcare / Pharma", tier: "Active", linkedin: "https://linkedin.com/company/cencora", website: "cencora.com", contacts: 0, lastUpdated: "3d ago", logo: "CE", hq: "Conshohocken, PA", employees: "46,000", founded: "2023", revenue: "$262B", departments: [], people: [] },
  { id: "iag", name: "IAG", industry: "Insurance", tier: "Active", linkedin: "https://linkedin.com/company/iag", website: "iag.com.au", contacts: 0, lastUpdated: "5d ago", logo: "IA", hq: "Sydney, AU", employees: "15,000", founded: "2000", revenue: "$18B AUD", departments: [], people: [] },
  { id: "edwards", name: "Edwards Life Sciences", industry: "Medical Devices", tier: "Prospect", linkedin: "https://linkedin.com/company/edwards", website: "edwards.com", contacts: 0, lastUpdated: "1w ago", logo: "EL", hq: "Irvine, CA", employees: "19,000", founded: "1958", revenue: "$5.6B", departments: [], people: [] },
];

// --- Signal Types ---

export const SIGNAL_TYPES: SignalType[] = [
  { id: "job_posting", label: "Job Postings", icon: "\u{1F4BC}", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  { id: "leadership_change", label: "Leadership Changes", icon: "\u{1F454}", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  { id: "tech_adoption", label: "Tech Stack", icon: "\u26A1", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { id: "compliance", label: "Compliance", icon: "\u{1F6E1}\uFE0F", color: "#059669", bg: "rgba(5,150,105,0.08)" },
  { id: "ai_hire", label: "AI Hires", icon: "\u{1F9E0}", color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  { id: "announcement", label: "Announcements", icon: "\u{1F4E2}", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { id: "security_incident", label: "Security Incidents", icon: "\u{1F6A8}", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { id: "linkedin_bio", label: "LinkedIn Bios", icon: "\u{1F517}", color: "#14b8a6", bg: "rgba(20,184,166,0.08)" },
];

// --- Signals ---

export const INITIAL_SIGNALS: Signal[] = [
  { id: "s1", type: "job_posting", accountId: "techcorp", title: "Hiring: AI Governance Lead", summary: "TechCorp posted a role for 'AI Governance Lead' requiring experience with LLM deployment policies, model risk management, and AI compliance frameworks.", severity: "high", source: "LinkedIn Jobs", timestamp: "2h ago", date: "2026-02-13", read: false, url: "#" },
  { id: "s2", type: "leadership_change", accountId: "cencora", title: "New CISO Appointed", summary: "Cencora appointed Maria Torres as Chief Information Security Officer. Previously VP Security at Pfizer with focus on AI-enabled threat detection.", severity: "high", source: "Press Release", timestamp: "5h ago", date: "2026-02-13", read: false, url: "#" },
  { id: "s3", type: "tech_adoption", accountId: "meridian", title: "CrewAI mentioned in engineering blog", summary: "Meridian Financial engineering blog post discusses evaluating CrewAI and LangGraph for automating compliance document processing workflows.", severity: "high", source: "Company Blog", timestamp: "8h ago", date: "2026-02-13", read: false, url: "#" },
  { id: "s4", type: "security_incident", accountId: "iag", title: "AI chatbot data exposure reported", summary: "Australian media reported IAG's customer-facing AI chatbot inadvertently exposed policy details to unauthorized users. Investigation underway.", severity: "high", source: "AFR", timestamp: "1d ago", date: "2026-02-12", read: true, url: "#" },
  { id: "s5", type: "compliance", accountId: "edwards", title: "FDA AI/ML regulatory submission", summary: "Edwards Life Sciences filed FDA submission referencing AI/ML-based predictive algorithms for patient monitoring. Requires governance framework documentation.", severity: "medium", source: "FDA Database", timestamp: "1d ago", date: "2026-02-12", read: true, url: "#" },
  { id: "s6", type: "ai_hire", accountId: "techcorp", title: "3 new ML Engineers onboarded", summary: "LinkedIn shows 3 new ML Engineer profiles listing TechCorp as employer in last 2 weeks. All mention LLM fine-tuning and agent frameworks in bios.", severity: "medium", source: "LinkedIn", timestamp: "1d ago", date: "2026-02-12", read: true, url: "#" },
  { id: "s7", type: "linkedin_bio", accountId: "techcorp", title: "CTO added 'AI Agent Infrastructure' to bio", summary: "Marcus Rivera (CTO) updated LinkedIn headline to include 'Building AI Agent Infrastructure'. Previously 'Platform Engineering & Distributed Systems'.", severity: "medium", source: "LinkedIn", timestamp: "2d ago", date: "2026-02-11", read: true, url: "#" },
  { id: "s8", type: "announcement", accountId: "cencora", title: "Board announces AI-first strategy", summary: "Cencora Q4 earnings call: CEO stated 'AI agents will be central to our supply chain transformation in 2026' with $50M allocated to AI initiatives.", severity: "high", source: "Earnings Call", timestamp: "2d ago", date: "2026-02-11", read: true, url: "#" },
  { id: "s9", type: "job_posting", accountId: "iag", title: "Hiring: MCP Integration Engineer", summary: "IAG posted role for 'MCP Integration Engineer' \u2014 first explicit mention of Model Context Protocol in their job listings. Reports to VP of AI Platform.", severity: "high", source: "Seek.com.au", timestamp: "3d ago", date: "2026-02-10", read: true, url: "#" },
  { id: "s10", type: "tech_adoption", accountId: "cencora", title: "Anthropic partnership announced", summary: "Cencora announced strategic partnership with Anthropic for deploying Claude-based agents across pharmaceutical distribution network.", severity: "high", source: "Press Release", timestamp: "3d ago", date: "2026-02-10", read: true, url: "#" },
  { id: "s11", type: "compliance", accountId: "meridian", title: "SOC2 Type II audit initiated", summary: "Meridian Financial began SOC2 Type II audit with expanded scope covering AI/ML systems and automated decision-making processes.", severity: "medium", source: "Vendor Network", timestamp: "4d ago", date: "2026-02-09", read: true, url: "#" },
  { id: "s12", type: "ai_hire", accountId: "edwards", title: "VP of AI & Digital Health hired", summary: "Edwards Life Sciences hired Dr. Kevin Park as VP of AI & Digital Health from Medtronic. His Medtronic team built agent-based diagnostic systems.", severity: "high", source: "LinkedIn", timestamp: "5d ago", date: "2026-02-08", read: true, url: "#" },
  { id: "s13", type: "linkedin_bio", accountId: "meridian", title: "4 engineers added 'LangChain' to skills", summary: "Four Meridian Financial engineers added LangChain to their LinkedIn skills in the past week, suggesting active adoption across the team.", severity: "low", source: "LinkedIn", timestamp: "5d ago", date: "2026-02-08", read: true, url: "#" },
  { id: "s14", type: "announcement", accountId: "iag", title: "Conference talk: 'AI in Insurance Claims'", summary: "IAG's Head of AI presenting at Insurance Innovation Summit on 'Autonomous AI Agents for Claims Processing' \u2014 abstract mentions governance challenges.", severity: "medium", source: "Event Listing", timestamp: "6d ago", date: "2026-02-07", read: true, url: "#" },
  { id: "s15", type: "security_incident", accountId: "techcorp", title: "Internal AI agent permissions audit", summary: "TechCorp security team conducted emergency audit of AI agent permissions after internal report flagged agents accessing unauthorized data sources.", severity: "medium", source: "Industry Contact", timestamp: "1w ago", date: "2026-02-06", read: true, url: "#" },
];

// --- Trend Data ---

export const TREND_DATA = [
  { week: "Jan 6", count: 4 },
  { week: "Jan 13", count: 7 },
  { week: "Jan 20", count: 5 },
  { week: "Jan 27", count: 9 },
  { week: "Feb 3", count: 11 },
  { week: "Feb 10", count: 15 },
];

// --- Module Agents ---

export const MODULE_AGENTS: Record<string, ModuleAgentGroup> = {
  orgMapper: {
    label: "Org Mapper", icon: "\u{1F5C2}",
    agents: [
      { id: "linkedin_scraper", name: "LinkedIn Scraper", icon: "\u{1F517}", status: "configured", desc: "Extracts org structure from LinkedIn", apiKeys: ["LinkedIn API Key"] },
      { id: "attio_sync", name: "Attio Sync", icon: "\u{1F4C7}", status: "configured", desc: "Imports contacts from Attio CRM", apiKeys: ["Attio API Key"] },
      { id: "enrichment", name: "Enrichment Agent", icon: "\u2728", status: "idle", desc: "Enriches profiles with role and social data", apiKeys: [] },
    ]
  },
  compIntel: {
    label: "Comp Intel", icon: "\u{1F4D6}",
    agents: [
      { id: "discovery", name: "Discovery Agent", icon: "\u{1F50D}", status: "configured", desc: "Identifies competitors via web research", apiKeys: ["Anthropic API Key", "Brave Search Key"] },
      { id: "deep_dive", name: "Deep Dive Agent", icon: "\u{1F52C}", status: "configured", desc: "Researches leadership, funding, product", apiKeys: ["Anthropic API Key"] },
      { id: "report_gen", name: "Report Agent", icon: "\u{1F4CA}", status: "configured", desc: "Synthesises intelligence report", apiKeys: ["Anthropic API Key"] },
    ]
  },
  signalTracker: {
    label: "Signal Tracker", icon: "\u{1F4E1}",
    agents: [
      { id: "job_scanner", name: "Job Board Scanner", icon: "\u{1F4BC}", status: "configured", desc: "Monitors job boards for AI governance roles", apiKeys: ["Bright Data Key"] },
      { id: "news_monitor", name: "News Monitor", icon: "\u{1F4F0}", status: "idle", desc: "Tracks press releases and announcements", apiKeys: ["News API Key"] },
      { id: "linkedin_monitor", name: "LinkedIn Monitor", icon: "\u{1F517}", status: "configured", desc: "Watches bios and job changes", apiKeys: ["LinkedIn API Key"] },
      { id: "compliance_scanner", name: "Regulatory Scanner", icon: "\u{1F6E1}\uFE0F", status: "idle", desc: "Monitors FDA, SEC, APRA filings", apiKeys: [] },
    ]
  },
};
