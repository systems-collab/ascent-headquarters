"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { STAGE_LABELS } from "@/lib/constants";
import type { Stage } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#f97316", "#ea580c", "#fb923c", "#fdba74", "#fed7aa"];

interface Datum {
  name: string;
  value: number;
}

export function StageChart() {
  const [data, setData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: startups } = await supabase
        .from("startups")
        .select("stage");

      if (!startups) {
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      for (const s of startups) {
        if (!s.stage) continue;
        counts[s.stage] = (counts[s.stage] ?? 0) + 1;
      }

      setData(
        Object.entries(counts).map(([key, value]) => ({
          name: STAGE_LABELS[key as Stage] ?? key,
          value,
        })),
      );
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Founders by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No stage data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
