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
import { LOCATION_LABELS } from "@/lib/constants";
import type { AuLocation } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Datum {
  name: string;
  count: number;
}

export function GeoChart() {
  const [data, setData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("location");

      if (!profiles) {
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      for (const p of profiles) {
        if (!p.location) continue;
        counts[p.location] = (counts[p.location] ?? 0) + 1;
      }

      setData(
        Object.entries(counts)
          .map(([key, count]) => ({
            name: LOCATION_LABELS[key as AuLocation] ?? key,
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
        <CardTitle>Founders by Location</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No location data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
