export interface SSEEvent {
  type: "status" | "discovery" | "deep-dive" | "report" | "error" | "done";
  agent?: string;
  step?: string;
  detail?: string;
  data?: unknown;
}

export interface CompanyProfile {
  name: string;
  domain: string;
  industry: string;
  subIndustry: string;
  hq?: string;
  description?: string;
}

export interface FundingInfo {
  round?: string;
  amount?: string;
  investors?: string[];
  date?: string;
}

export interface KeyLeader {
  name: string;
  title: string;
  linkedinUrl?: string;
}

export interface RecentMove {
  date: string;
  description: string;
  source?: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorCard {
  name: string;
  domain?: string;
  description?: string;
  founded?: string;
  hq?: string;
  teamSize?: string;
  funding?: FundingInfo;
  keyLeaders?: KeyLeader[];
  whatTheyDo?: string;
  recentMoves?: RecentMove[];
  swot?: SwotAnalysis;
  threatLevel: "Direct" | "Adjacent" | "Emerging";
  confidenceScore?: number;
}

export interface GtmSignals {
  pricing?: string[];
  channels?: string[];
  icp?: string[];
}

export interface StrategicRecommendation {
  recommendation: string;
  confidence: "high" | "medium" | "low";
  rationale: string;
}

export interface ReportSummary {
  marketPositioning?: string[];
  competitiveMoats?: string[];
  vulnerabilities?: string[];
  gtmSignals?: GtmSignals;
  technologyDifferentiation?: string[];
  strategicRecommendations?: StrategicRecommendation[];
  risks?: string[];
  opportunities?: string[];
}

export interface AnalysisInput {
  domain: string;
  industry: string;
  subIndustry: string;
  hq?: string;
  targetGeography?: string[];
  knownCompetitors?: string;
}

export interface DiscoveryResult {
  profile: CompanyProfile;
  competitors: CompetitorCard[];
}

export interface DeepDiveResult {
  competitors: CompetitorCard[];
}

export interface ReportResult {
  summary: ReportSummary;
  competitors: CompetitorCard[];
}
