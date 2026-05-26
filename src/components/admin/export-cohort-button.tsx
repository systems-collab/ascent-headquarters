"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import {
  STAGE_LABELS,
  SECTOR_LABELS,
  LOCATION_LABELS,
  CHALLENGE_LABELS,
  PATHWAY_LABELS,
} from "@/lib/constants";
import type {
  Stage,
  Sector,
  AuLocation,
  BiggestChallenge,
  FundingPathway,
} from "@/types/database";

/**
 * Flat shape we serialise to CSV. We deliberately denormalise the joined
 * Supabase response into one row per founder so admins can open the file
 * in Excel or Google Sheets without any further transformation.
 */
interface CohortRow {
  founderName: string;
  location: string;
  startupName: string;
  sector: string;
  stage: string;
  teamSize: string;
  hasCofounder: string;
  monthlyRevenue: string;
  description: string;
  raisedBefore: string;
  amountRaised: string;
  fundingTypes: string;
  targetPathways: string;
  targetRaise: string;
  biggestChallenge: string;
  pitchReadiness: number | null;
  financialLiteracy: number | null;
  fundingStrategy: number | null;
  businessMaturity: number | null;
  marketAwareness: number | null;
  overallScore: number | null;
  signupDate: string;
}

const COLUMNS: CsvColumn<CohortRow>[] = [
  { header: "Founder", value: (r) => r.founderName },
  { header: "Location", value: (r) => r.location },
  { header: "Startup", value: (r) => r.startupName },
  { header: "Sector", value: (r) => r.sector },
  { header: "Stage", value: (r) => r.stage },
  { header: "Team size", value: (r) => r.teamSize },
  { header: "Has co-founder", value: (r) => r.hasCofounder },
  { header: "Monthly revenue", value: (r) => r.monthlyRevenue },
  { header: "Description", value: (r) => r.description },
  { header: "Raised before", value: (r) => r.raisedBefore },
  { header: "Amount raised", value: (r) => r.amountRaised },
  { header: "Funding types", value: (r) => r.fundingTypes },
  { header: "Target pathways", value: (r) => r.targetPathways },
  { header: "Target raise", value: (r) => r.targetRaise },
  { header: "Biggest challenge", value: (r) => r.biggestChallenge },
  { header: "Pitch readiness", value: (r) => r.pitchReadiness },
  { header: "Financial literacy", value: (r) => r.financialLiteracy },
  { header: "Funding strategy", value: (r) => r.fundingStrategy },
  { header: "Business maturity", value: (r) => r.businessMaturity },
  { header: "Market awareness", value: (r) => r.marketAwareness },
  { header: "Overall score", value: (r) => r.overallScore },
  { header: "Signup date", value: (r) => r.signupDate },
];

interface JoinedProfile {
  id: string;
  full_name: string | null;
  location: string | null;
  created_at: string;
  startups:
    | {
        name: string | null;
        sector: string | null;
        stage: string | null;
        team_size: string | null;
        has_cofounder: boolean | null;
        monthly_revenue: string | null;
        description: string | null;
      }
    | Array<{
        name: string | null;
        sector: string | null;
        stage: string | null;
        team_size: string | null;
        has_cofounder: boolean | null;
        monthly_revenue: string | null;
        description: string | null;
      }>
    | null;
  questionnaire_responses:
    | {
        raised_before: boolean | null;
        amount_raised: string | null;
        funding_types: string[] | null;
        target_pathways: string[] | null;
        target_raise: string | null;
        biggest_challenge: string | null;
      }
    | Array<{
        raised_before: boolean | null;
        amount_raised: string | null;
        funding_types: string[] | null;
        target_pathways: string[] | null;
        target_raise: string | null;
        biggest_challenge: string | null;
      }>
    | null;
  readiness_scores:
    | {
        pitch_readiness: number | null;
        financial_literacy: number | null;
        funding_strategy: number | null;
        business_maturity: number | null;
        market_awareness: number | null;
        overall_score: number | null;
      }
    | Array<{
        pitch_readiness: number | null;
        financial_literacy: number | null;
        funding_strategy: number | null;
        business_maturity: number | null;
        market_awareness: number | null;
        overall_score: number | null;
      }>
    | null;
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function labeled(map: Record<string, string>, key: string | null | undefined): string {
  if (!key) return "";
  return map[key] ?? key;
}

function joinList(
  map: Record<string, string>,
  values: string[] | null | undefined,
): string {
  if (!values || values.length === 0) return "";
  return values.map((v) => map[v] ?? v).join("; ");
}

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapRow(p: JoinedProfile): CohortRow {
  const startup = unwrap(p.startups);
  const q = unwrap(p.questionnaire_responses);
  const scores = unwrap(p.readiness_scores);

  return {
    founderName: p.full_name ?? "",
    location: labeled(LOCATION_LABELS, p.location as AuLocation | null),
    startupName: startup?.name ?? "",
    sector: labeled(SECTOR_LABELS, startup?.sector as Sector | null),
    stage: labeled(STAGE_LABELS, startup?.stage as Stage | null),
    teamSize: startup?.team_size ?? "",
    hasCofounder:
      startup?.has_cofounder === null || startup?.has_cofounder === undefined
        ? ""
        : startup.has_cofounder
        ? "Yes"
        : "No",
    monthlyRevenue: startup?.monthly_revenue ?? "",
    description: startup?.description ?? "",
    raisedBefore:
      q?.raised_before === null || q?.raised_before === undefined
        ? ""
        : q.raised_before
        ? "Yes"
        : "No",
    amountRaised: q?.amount_raised ?? "",
    fundingTypes: q?.funding_types ? q.funding_types.join("; ") : "",
    targetPathways: joinList(
      PATHWAY_LABELS,
      (q?.target_pathways ?? null) as FundingPathway[] | null,
    ),
    targetRaise: q?.target_raise ?? "",
    biggestChallenge: labeled(
      CHALLENGE_LABELS,
      q?.biggest_challenge as BiggestChallenge | null,
    ),
    pitchReadiness: scores?.pitch_readiness ?? null,
    financialLiteracy: scores?.financial_literacy ?? null,
    fundingStrategy: scores?.funding_strategy ?? null,
    businessMaturity: scores?.business_maturity ?? null,
    marketAwareness: scores?.market_awareness ?? null,
    overallScore: scores?.overall_score ?? null,
    signupDate: new Date(p.created_at).toISOString(),
  };
}

export function ExportCohortButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select(
          [
            "id",
            "full_name",
            "location",
            "created_at",
            "startups(name, sector, stage, team_size, has_cofounder, monthly_revenue, description)",
            "questionnaire_responses(raised_before, amount_raised, funding_types, target_pathways, target_raise, biggest_challenge)",
            "readiness_scores(pitch_readiness, financial_literacy, funding_strategy, business_maturity, market_awareness, overall_score)",
          ].join(", "),
        )
        .eq("role", "founder")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }

      const rows = (data as unknown as JoinedProfile[] | null) ?? [];
      const csv = buildCsv(rows.map(mapRow), COLUMNS);
      downloadCsv(`ascent-cohort-${todayStamp()}.csv`, csv);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {busy ? "Preparing..." : "Download cohort CSV"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
