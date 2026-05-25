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
import { SECTOR_LABELS } from "@/lib/constants";
import type { Sector } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Datum {
  name: string;
  count: number;
}

export function SectorChart() {
  const [data, setData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: startups } = await supabase
        .from("startups")
        .select("sector");

      if (!startups) {
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      for (const s of startups) {
        if (!s.sector) continue;
        counts[s.sector] = (counts[s.sector] ?? 0) + 1;
      }

      setData(
        Object.entries(counts)
          .map(([key, count]) => ({
            name: SECTOR_LABELS[key as Sector] ?? key,
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
        <CardTitle>Founders by Sector</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No sector data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
