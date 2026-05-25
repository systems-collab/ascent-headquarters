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
import { CHALLENGE_LABELS } from "@/lib/constants";
import type { BiggestChallenge } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Datum {
  name: string;
  count: number;
}

export function ChallengesChart() {
  const [data, setData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: responses } = await supabase
        .from("questionnaire_responses")
        .select("biggest_challenge");

      if (!responses) {
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      for (const r of responses) {
        if (!r.biggest_challenge) continue;
        counts[r.biggest_challenge] = (counts[r.biggest_challenge] ?? 0) + 1;
      }

      setData(
        Object.entries(counts)
          .map(([key, count]) => ({
            name: CHALLENGE_LABELS[key as BiggestChallenge] ?? key,
            count,
          }))
          .sort((a, b) => b.count - a.count),
      );
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biggest Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No challenge data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={160} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
