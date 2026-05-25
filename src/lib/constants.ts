import type { Stage, Sector, AuLocation, FundingPathway, BiggestChallenge } from "@/types/database";

export const STAGE_LABELS: Record<Stage, string> = {
  idea: "Idea Stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b_plus: "Series B+",
};

export const SECTOR_LABELS: Record<Sector, string> = {
  fintech: "Fintech",
  healthtech: "Healthtech",
  edtech: "Edtech",
  cleantech: "Cleantech",
  saas: "SaaS",
  ecommerce: "E-commerce",
  deeptech: "Deeptech",
  agritech: "Agritech",
  creative_media: "Creative/Media",
  social_impact: "Social Impact",
  other: "Other",
};

export const LOCATION_LABELS: Record<AuLocation, string> = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  wa: "Western Australia",
  sa: "South Australia",
  tas: "Tasmania",
  act: "ACT",
  nt: "Northern Territory",
  remote_regional: "Remote/Regional",
};

export const PATHWAY_LABELS: Record<FundingPathway, string> = {
  venture_capital: "Venture Capital",
  angel_investment: "Angel Investment",
  government_grants: "Government Grants",
  accelerator_programs: "Accelerator Programs",
  revenue_based_financing: "Revenue-based Financing",
  debt_loans: "Debt/Loans",
  crowdfunding: "Crowdfunding",
  not_sure: "Not sure yet",
};

export const CHALLENGE_LABELS: Record<BiggestChallenge, string> = {
  dont_know_where_to_start: "Don't know where to start",
  have_deck_no_meetings: "Have a pitch deck but can't get meetings",
  getting_meetings_not_closing: "Getting meetings but not closing",
  legal_financial_structures: "Understanding legal/financial structures",
  finding_right_capital: "Finding the right type of capital",
  building_investor_relationships: "Building investor relationships",
  other: "Other",
};

export const ASCENT_PHASES = [
  { number: 1, title: "Fundraising Foundations", description: "Build your base understanding of startup capital and the Australian funding landscape." },
  { number: 2, title: "Preparation & Readiness", description: "Get your pitch deck, financial model, and legal foundations investor-ready." },
  { number: 3, title: "Funding Pathways", description: "Explore 19 capital pathways from VC to grants to crowdfunding." },
  { number: 4, title: "Executing the Raise", description: "Run your fundraise with confidence, from outreach to due diligence." },
  { number: 5, title: "Closing the Deal", description: "Navigate term sheets, negotiations, and the final close." },
  { number: 6, title: "Post-Raise Growth", description: "Deploy capital effectively and build toward your next milestone." },
] as const;

export const DIMENSION_LABELS: Record<string, string> = {
  pitch_readiness: "Pitch Readiness",
  financial_literacy: "Financial Literacy",
  funding_strategy: "Funding Strategy",
  business_maturity: "Business Maturity",
  market_awareness: "Market Awareness",
};

export const DIMENSION_INSIGHTS: Record<string, string> = {
  pitch_readiness: "Strengthen your pitch deck, financial model, and investor targeting.",
  financial_literacy: "Deepen your understanding of cap tables, revenue metrics, and capital history.",
  funding_strategy: "Clarify your funding pathway, target raise amount, and biggest challenges.",
  business_maturity: "Grow your team, validate revenue, and advance your startup stage.",
  market_awareness: "Build your knowledge of the Australian funding landscape and capital types.",
};
