"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIMENSION_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DIMENSIONS = [
  "pitch_readiness",
  "financial_literacy",
  "funding_strategy",
  "business_maturity",
  "market_awareness",
] as const;

interface DimensionAvg {
  key: string;
  label: string;
  avg: number;
}

export function ReadinessHeatmap() {
  const [data, setData] = useState<DimensionAvg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: scores } = await supabase
        .from("readiness_scores")
        .select(
          "pitch_readiness, financial_literacy, funding_strategy, business_maturity, market_awareness",
        );

      if (!scores || scores.length === 0) {
        setLoading(false);
        return;
      }

      const result: DimensionAvg[] = DIMENSIONS.map((dim) => {
        const values = scores.map(
          (s) => s[dim] as number,
        );
        const sum = values.reduce((a, b) => a + b, 0);
        return {
          key: dim,
          label: DIMENSION_LABELS[dim] ?? dim,
          avg: Math.round((sum / values.length) * 10) / 10,
        };
      });

      setData(result);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Score Averages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No readiness data yet
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((d) => (
              <div key={d.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{d.label}</span>
                  <span className="text-gray-500">{d.avg} / 10</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${(d.avg / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
