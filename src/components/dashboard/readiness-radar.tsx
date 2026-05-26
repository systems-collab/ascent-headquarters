"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { DIMENSION_LABELS } from "@/lib/constants";
import { useCountUp } from "@/hooks/use-count-up";
import type { ReadinessScore } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface ReadinessRadarProps {
  scores: ReadinessScore;
  /** Animate the overall score from 0 to its final value on mount. */
  animate?: boolean;
}

const DIMENSION_KEYS = [
  "pitch_readiness",
  "financial_literacy",
  "funding_strategy",
  "business_maturity",
  "market_awareness",
] as const;

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function ReadinessRadar({
  scores,
  animate = false,
}: ReadinessRadarProps) {
  const chartData = DIMENSION_KEYS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    value: scores[key],
    fullMark: 100,
  }));

  const overall = Math.round(scores.overall_score);
  const displayValue = useCountUp({ end: overall, enabled: animate });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span
              className={`text-5xl font-bold tabular-nums ${getScoreColor(overall)}`}
            >
              {displayValue}
            </span>
            <span className="ml-1 text-lg text-muted-foreground">/100</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Readiness"
                  dataKey="value"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
