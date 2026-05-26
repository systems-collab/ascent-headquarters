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

// Concrete next steps surfaced on the Command Center. Three buckets per
// dimension keyed on score band; the action picker pulls the lowest-banded
// item from each weak dimension.
export interface DimensionAction {
  title: string;
  description: string;
  phase: number;
}

export const DIMENSION_ACTIONS: Record<string, Record<"low" | "medium" | "high", DimensionAction>> = {
  pitch_readiness: {
    low: {
      title: "Draft your first pitch deck",
      description: "Start with a 10-slide narrative covering problem, solution, market, traction, team, and ask. The Preparation phase walks through each slide.",
      phase: 2,
    },
    medium: {
      title: "Pressure-test your deck with three founders",
      description: "Send your current deck to three peers in the Ascent network for feedback before sending it to investors.",
      phase: 2,
    },
    high: {
      title: "Build your target investor list",
      description: "List 30 to 50 investors who fit your stage, sector, and geography. Rank by likelihood and warm-intro path.",
      phase: 4,
    },
  },
  financial_literacy: {
    low: {
      title: "Learn cap tables in 60 minutes",
      description: "Most founders learn this once and refer back for years. Walk through dilution scenarios so you can read any term sheet.",
      phase: 1,
    },
    medium: {
      title: "Build a 3-statement financial model",
      description: "If you do not have a real revenue, P&L, and cash-flow model yet, this is the highest leverage thing you can build this month.",
      phase: 2,
    },
    high: {
      title: "Run your runway scenarios",
      description: "Model three scenarios: raise now, raise in 6 months, raise in 12 months. Know your zero-cash date in each.",
      phase: 5,
    },
  },
  funding_strategy: {
    low: {
      title: "Map the 19 capital pathways",
      description: "Most founders default to VC without realising grants, accelerators, revenue-based financing, or angels might fit better. Survey the landscape first.",
      phase: 3,
    },
    medium: {
      title: "Lock in your target raise amount",
      description: "Work backwards from your 18-month plan: hires, runway, milestones. The number should fall out of the model, not be picked.",
      phase: 3,
    },
    high: {
      title: "Prepare your outreach sequence",
      description: "Templates for first email, follow-up, and warm-intro asks. Build the sequence before you start sending.",
      phase: 4,
    },
  },
  business_maturity: {
    low: {
      title: "Validate one paying customer use case",
      description: "Investors at every stage care about evidence. One paying customer who can articulate ROI beats ten pilot conversations.",
      phase: 1,
    },
    medium: {
      title: "Hire your first key role",
      description: "Identify the single hire that would 10x your output. Use the Preparation phase resources on early-stage hiring and equity.",
      phase: 2,
    },
    high: {
      title: "Build a board or advisor cadence",
      description: "Establish a monthly investor update before you start raising. Train the rhythm now so it is automatic later.",
      phase: 6,
    },
  },
  market_awareness: {
    low: {
      title: "Read the AU funding landscape briefing",
      description: "Australia's capital landscape differs from US playbooks. Understanding local nuances saves you months of mis-targeted outreach.",
      phase: 1,
    },
    medium: {
      title: "Attend one Sydney founder event this month",
      description: "Pattern-match by being in the room. Fishburners hosts weekly meetups. Three conversations beat ten cold emails.",
      phase: 1,
    },
    high: {
      title: "Build relationships before you need them",
      description: "Start meeting investors 6 to 12 months before your raise. Coffee meetings now compound into term sheets later.",
      phase: 4,
    },
  },
};
