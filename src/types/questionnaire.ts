import type {
  AuLocation, Sector, Stage, TeamSize, MonthlyRevenue,
  AmountRaised, FundingType, TriState, Confidence,
  AuLandscape, FundingPathway, BiggestChallenge, TargetRaise,
} from "./database";

export interface QuestionnaireFormData {
  full_name: string;
  email: string;
  location: AuLocation | "";
  startup_name: string;
  sector: Sector | "";
  description: string;
  stage: Stage | "";
  team_size: TeamSize | "";
  has_cofounder: boolean | null;
  raised_before: boolean | null;
  amount_raised: AmountRaised | "";
  funding_types: FundingType[];
  monthly_revenue: MonthlyRevenue | "";
  has_pitch_deck: TriState | "";
  has_financial_model: TriState | "";
  understands_cap_tables: Confidence | "";
  identified_investors: Confidence | "";
  au_landscape_rating: AuLandscape | "";
  target_pathways: FundingPathway[];
  biggest_challenge: BiggestChallenge | "";
  target_raise: TargetRaise | "";
}

export const EMPTY_FORM: QuestionnaireFormData = {
  full_name: "",
  email: "",
  location: "",
  startup_name: "",
  sector: "",
  description: "",
  stage: "",
  team_size: "",
  has_cofounder: null,
  raised_before: null,
  amount_raised: "",
  funding_types: [],
  monthly_revenue: "",
  has_pitch_deck: "",
  has_financial_model: "",
  understands_cap_tables: "",
  identified_investors: "",
  au_landscape_rating: "",
  target_pathways: [],
  biggest_challenge: "",
  target_raise: "",
};

export const TOTAL_STEPS = 6;
