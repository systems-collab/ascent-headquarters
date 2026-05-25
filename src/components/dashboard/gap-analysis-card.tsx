import Link from "next/link";
import { DIMENSION_LABELS, DIMENSION_INSIGHTS } from "@/lib/constants";
import type { ReadinessScore } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface GapAnalysisCardProps {
  scores: ReadinessScore;
}

const DIMENSION_KEYS = [
  "pitch_readiness",
  "financial_literacy",
  "funding_strategy",
  "business_maturity",
  "market_awareness",
] as const;

function getWeakestDimensions(scores: ReadinessScore, count: number) {
  return [...DIMENSION_KEYS]
    .map((key) => ({
      key,
      label: DIMENSION_LABELS[key],
      score: scores[key],
      insight: DIMENSION_INSIGHTS[key],
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

function getBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-500";
}

export function GapAnalysisCard({ scores }: GapAnalysisCardProps) {
  const gaps = getWeakestDimensions(scores, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {gaps.map((gap) => (
            <li key={gap.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{gap.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(gap.score)}/100
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${getBarColor(gap.score)}`}
                  style={{ width: `${Math.max(gap.score, 2)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {gap.insight}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link
          href="/launchpad"
          className="text-sm font-medium text-fishburners-600 hover:text-fishburners-700"
        >
          Explore Ascent curriculum &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
