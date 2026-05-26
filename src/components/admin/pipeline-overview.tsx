"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalFounders: number;
  completedQuestionnaires: number;
  conversionRate: number;
}

export function PipelineOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const [profileRes, questionnaireRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("questionnaire_responses")
          .select("id", { count: "exact", head: true }),
      ]);

      const total = profileRes.count ?? 0;
      const completed = questionnaireRes.count ?? 0;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        totalFounders: total,
        completedQuestionnaires: completed,
        conversionRate: rate,
      });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="animate-pulse py-6">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Founders", value: stats.totalFounders },
    { label: "Questionnaires Completed", value: stats.completedQuestionnaires },
    { label: "Conversion Rate", value: `${stats.conversionRate}%` },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
