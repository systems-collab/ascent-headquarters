"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Stage } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface BenchmarkCardProps {
  stage: Stage | null;
  overallScore: number;
}

interface BenchmarkData {
  avg_overall: number;
  cohort_size: number;
}

export function BenchmarkCard({ stage, overallScore }: BenchmarkCardProps) {
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stage) {
      setLoading(false);
      return;
    }

    async function fetchBenchmark() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_stage_benchmarks", {
        p_stage: stage,
      });

      // RPC RETURNS TABLE => client always gets an array (empty when cohort < 10)
      if (!error && Array.isArray(data) && data.length > 0) {
        setBenchmark(data[0] as BenchmarkData);
      }
      setLoading(false);
    }

    fetchBenchmark();
  }, [stage]);

  const hasCohort = benchmark && benchmark.cohort_size >= 10;
  const roundedScore = Math.round(overallScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage Benchmark</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-fishburners-500 border-t-transparent" />
          </div>
        ) : !stage ? (
          <p className="text-sm text-muted-foreground">
            Set your startup stage to see benchmarks.
          </p>
        ) : hasCohort ? (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Your score</span>
                <span>{roundedScore}/100</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-fishburners-500"
                  style={{ width: `${Math.max(roundedScore, 2)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Stage average</span>
                <span>{Math.round(benchmark.avg_overall)}/100</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-gray-400"
                  style={{
                    width: `${Math.max(Math.round(benchmark.avg_overall), 2)}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Compared against {benchmark.cohort_size} founders at the same
              stage.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not enough data yet. We need at least 10 founders at your stage to
            show meaningful benchmarks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
