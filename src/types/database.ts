export type UserRole = "founder" | "admin";

export type Stage = "idea" | "pre_seed" | "seed" | "series_a" | "series_b_plus";
export type TeamSize = "solo" | "2_3" | "4_10" | "11_plus";
export type Sector =
  | "fintech" | "healthtech" | "edtech" | "cleantech" | "saas"
  | "ecommerce" | "deeptech" | "agritech" | "creative_media"
  | "social_impact" | "other";
export type MonthlyRevenue = "pre_revenue" | "under_5k" | "5k_20k" | "20k_100k" | "100k_plus";
export type AmountRaised = "under_50k" | "50k_250k" | "250k_1m" | "1m_5m" | "5m_plus";
export type TriState = "yes" | "in_progress" | "no";
export type Confidence = "confident" | "somewhat" | "not_yet";
export type AuLandscape = "strong" | "moderate" | "limited";
export type FundingType =
  | "bootstrapped" | "friends_family" | "angel" | "vc"
  | "grant" | "accelerator" | "debt" | "crowdfunding";
export type FundingPathway =
  | "venture_capital" | "angel_investment" | "government_grants"
  | "accelerator_programs" | "revenue_based_financing" | "debt_loans"
  | "crowdfunding" | "not_sure";
export type BiggestChallenge =
  | "dont_know_where_to_start" | "have_deck_no_meetings"
  | "getting_meetings_not_closing" | "legal_financial_structures"
  | "finding_right_capital" | "building_investor_relationships" | "other";
export type TargetRaise =
  | "under_100k" | "100k_500k" | "500k_2m" | "2m_10m" | "10m_plus" | "not_sure";
export type AuLocation =
  | "nsw" | "vic" | "qld" | "wa" | "sa" | "tas" | "act" | "nt" | "remote_regional";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  location: AuLocation | null;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  founder_id: string;
  name: string;
  sector: Sector | null;
  description: string | null;
  stage: Stage | null;
  team_size: TeamSize | null;
  has_cofounder: boolean | null;
  monthly_revenue: MonthlyRevenue | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  founder_id: string;
  raised_before: boolean | null;
  amount_raised: AmountRaised | null;
  funding_types: FundingType[];
  has_pitch_deck: TriState | null;
  has_financial_model: TriState | null;
  understands_cap_tables: Confidence | null;
  identified_investors: Confidence | null;
  au_landscape_rating: AuLandscape | null;
  target_pathways: FundingPathway[];
  biggest_challenge: BiggestChallenge | null;
  target_raise: TargetRaise | null;
  created_at: string;
  updated_at: string;
}

export interface ReadinessScore {
  id: string;
  founder_id: string;
  pitch_readiness: number;
  financial_literacy: number;
  funding_strategy: number;
  business_maturity: number;
  market_awareness: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}
