"use client";

import Link from "next/link";
import {
  DIMENSION_ACTIONS,
  DIMENSION_LABELS,
  type DimensionAction,
} from "@/lib/constants";
import type { ReadinessScore } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface ActionItemsCardProps {
  scores: ReadinessScore;
}

const DIMENSION_KEYS = [
  "pitch_readiness",
  "financial_literacy",
  "funding_strategy",
  "business_maturity",
  "market_awareness",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

interface RankedAction {
  dimensionKey: DimensionKey;
  dimensionLabel: string;
  score: number;
  band: "low" | "medium" | "high";
  action: DimensionAction;
}

function scoreToBand(score: number): "low" | "medium" | "high" {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

function rankActions(scores: ReadinessScore): RankedAction[] {
  // Sort dimensions by score ascending so the weakest areas get acted on
  // first. We pick the top three so the founder is not overwhelmed.
  return DIMENSION_KEYS.map<RankedAction>((key) => {
    const score = scores[key];
    const band = scoreToBand(score);
    return {
      dimensionKey: key,
      dimensionLabel: DIMENSION_LABELS[key] ?? key,
      score,
      band,
      action: DIMENSION_ACTIONS[key][band],
    };
  })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function bandBadgeClasses(band: "low" | "medium" | "high"): string {
  if (band === "low") return "bg-red-100 text-red-700";
  if (band === "medium") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function bandLabel(band: "low" | "medium" | "high"): string {
  if (band === "low") return "Critical";
  if (band === "medium") return "Build";
  return "Advance";
}

export function ActionItemsCard({ scores }: ActionItemsCardProps) {
  const actions = rankActions(scores);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Next Three Moves</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ranked by the dimensions where you have the most ground to cover.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-5">
          {actions.map((item, index) => (
            <li
              key={item.dimensionKey}
              className="relative rounded-lg border border-gray-100 bg-gray-50/60 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fishburners-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {item.action.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${bandBadgeClasses(
                        item.band,
                      )}`}
                    >
                      {bandLabel(item.band)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.action.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-gray-500">
                      {item.dimensionLabel} score: {Math.round(item.score)}/100
                    </span>
                    <Link
                      href={`/launchpad#phase-${item.action.phase}`}
                      className="font-medium text-fishburners-600 hover:text-fishburners-700"
                    >
                      Go to Phase {item.action.phase} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
