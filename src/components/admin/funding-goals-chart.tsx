"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { PATHWAY_LABELS } from "@/lib/constants";
import type { FundingPathway, TargetRaise } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RAISE_LABELS: Record<TargetRaise, string> = {
  under_100k: "Under $100k",
  "100k_500k": "$100k - $500k",
  "500k_2m": "$500k - $2M",
  "2m_10m": "$2M - $10M",
  "10m_plus": "$10M+",
  not_sure: "Not sure",
};

interface Datum {
  name: string;
  count: number;
}

export function FundingGoalsChart() {
  const [pathwayData, setPathwayData] = useState<Datum[]>([]);
  const [raiseData, setRaiseData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: responses } = await supabase
        .from("questionnaire_responses")
        .select("target_pathways, target_raise");

      if (!responses) {
        setLoading(false);
        return;
      }

      // Count pathways (TEXT[] array, unnest client-side)
      const pathwayCounts: Record<string, number> = {};
      for (const r of responses) {
        if (!r.target_pathways) continue;
        for (const p of r.target_pathways) {
          pathwayCounts[p] = (pathwayCounts[p] ?? 0) + 1;
        }
      }
      setPathwayData(
        Object.entries(pathwayCounts)
          .map(([key, count]) => ({
            name: PATHWAY_LABELS[key as FundingPathway] ?? key,
            count,
          }))
          .sort((a, b) => b.count - a.count),
      );

      // Count target_raise
      const raiseCounts: Record<string, number> = {};
      for (const r of responses) {
        if (!r.target_raise) continue;
        raiseCounts[r.target_raise] = (raiseCounts[r.target_raise] ?? 0) + 1;
      }
      setRaiseData(
        Object.entries(raiseCounts).map(([key, count]) => ({
          name: RAISE_LABELS[key as TargetRaise] ?? key,
          count,
        })),
      );

      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funding Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const empty = pathwayData.length === 0 && raiseData.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding Goals</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No funding data yet
          </p>
        ) : (
          <div className="space-y-6">
            {pathwayData.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Preferred Pathways
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={pathwayData}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {raiseData.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Target Raise Amount
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={raiseData}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#ea580c"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
