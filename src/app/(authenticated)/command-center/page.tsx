"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { persistQuestionnaireIfNeeded } from "@/lib/persist-questionnaire";
import type { Profile, Startup, ReadinessScore } from "@/types/database";
import { ReadinessRadar } from "@/components/dashboard/readiness-radar";
import { GapAnalysisCard } from "@/components/dashboard/gap-analysis-card";
import { ProfileSnapshot } from "@/components/dashboard/profile-snapshot";
import { BenchmarkCard } from "@/components/dashboard/benchmark-card";

interface DashboardData {
  profile: Profile;
  startup: Startup;
  scores: ReadinessScore;
}

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await persistQuestionnaireIfNeeded();
      } catch {
        // Questionnaire persist is best-effort for returning users
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [profileRes, startupRes, scoresRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(),
        supabase
          .from("startups")
          .select("*")
          .eq("founder_id", user.id)
          .single(),
        supabase
          .from("readiness_scores")
          .select("*")
          .eq("founder_id", user.id)
          .single(),
      ]);

      if (profileRes.data && startupRes.data && scoresRes.data) {
        setData({
          profile: profileRes.data as Profile,
          startup: startupRes.data as Startup,
          scores: scoresRes.data as ReadinessScore,
        });
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fishburners-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Unable to load dashboard data. Please try refreshing the page.</p>
      </div>
    );
  }

  const firstName = data.profile.full_name.split(" ")[0] || "Founder";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {firstName}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <ReadinessRadar scores={data.scores} />
        <GapAnalysisCard scores={data.scores} />
        <ProfileSnapshot profile={data.profile} startup={data.startup} />
        <BenchmarkCard
          stage={data.startup.stage}
          overallScore={data.scores.overall_score}
        />
      </div>
    </div>
  );
}
