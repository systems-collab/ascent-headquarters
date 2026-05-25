"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STAGE_LABELS, SECTOR_LABELS } from "@/lib/constants";
import type { Stage, Sector } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Row {
  firstName: string;
  startupName: string;
  stage: string;
  sector: string;
  overallScore: number | null;
  signupDate: string;
}

export function RecentSignupsTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, created_at, startups(name, stage, sector), readiness_scores(overall_score)",
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data) {
        setLoading(false);
        return;
      }

      const mapped: Row[] = data.map((p) => {
        const startup = Array.isArray(p.startups)
          ? p.startups[0]
          : p.startups;
        const score = Array.isArray(p.readiness_scores)
          ? p.readiness_scores[0]
          : p.readiness_scores;

        return {
          firstName: (p.full_name ?? "").split(" ")[0] || "Unknown",
          startupName: startup?.name ?? "-",
          stage: startup?.stage
            ? (STAGE_LABELS[startup.stage as Stage] ?? startup.stage)
            : "-",
          sector: startup?.sector
            ? (SECTOR_LABELS[startup.sector as Sector] ?? startup.sector)
            : "-",
          overallScore: score?.overall_score ?? null,
          signupDate: new Date(p.created_at).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      });

      setRows(mapped);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signups</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No signups yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Startup</th>
                  <th className="pb-2 pr-4 font-medium">Stage</th>
                  <th className="pb-2 pr-4 font-medium">Sector</th>
                  <th className="pb-2 pr-4 font-medium">Score</th>
                  <th className="pb-2 font-medium">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.firstName}</td>
                    <td className="py-2 pr-4">{r.startupName}</td>
                    <td className="py-2 pr-4">{r.stage}</td>
                    <td className="py-2 pr-4">{r.sector}</td>
                    <td className="py-2 pr-4">
                      {r.overallScore !== null
                        ? r.overallScore.toFixed(1)
                        : "-"}
                    </td>
                    <td className="py-2">{r.signupDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
