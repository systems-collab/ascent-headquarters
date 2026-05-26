"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { persistQuestionnaireIfNeeded } from "@/lib/persist-questionnaire";
import type { Profile, Startup, ReadinessScore } from "@/types/database";
import { ReadinessRadar } from "@/components/dashboard/readiness-radar";
import { GapAnalysisCard } from "@/components/dashboard/gap-analysis-card";
import { ProfileSnapshot } from "@/components/dashboard/profile-snapshot";
import { BenchmarkCard } from "@/components/dashboard/benchmark-card";
import { ActionItemsCard } from "@/components/dashboard/action-items-card";

interface DashboardData {
  profile: Profile;
  startup: Startup;
  scores: ReadinessScore;
}

type LoadState = "loading" | "ready" | "needs_questionnaire" | "error";

// sessionStorage flag so the score reveal animation only fires once per
// browser session, not on every navigation back to the dashboard.
const SCORE_SEEN_KEY = "ascent_score_seen";

function shouldAnimateScore(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SCORE_SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

function markScoreSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCORE_SEEN_KEY, "1");
  } catch {
    // Ignore quota / privacy-mode errors; animation just plays again next time.
  }
}

export default function CommandCenterPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [animateScore, setAnimateScore] = useState(false);

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

      if (!user) {
        router.replace("/login");
        return;
      }

      const [profileRes, startupRes, scoresRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("startups").select("*").eq("founder_id", user.id).maybeSingle(),
        supabase.from("readiness_scores").select("*").eq("founder_id", user.id).maybeSingle(),
      ]);

      if (profileRes.data && startupRes.data && scoresRes.data) {
        setData({
          profile: profileRes.data as Profile,
          startup: startupRes.data as Startup,
          scores: scoresRes.data as ReadinessScore,
        });
        const shouldAnimate = shouldAnimateScore();
        if (shouldAnimate) {
          setAnimateScore(true);
          markScoreSeen();
        }
        setState("ready");
        return;
      }

      // Authenticated user with a profile but no questionnaire yet
      // (common for Google OAuth users who skipped Mission Briefing).
      if (profileRes.data && (!startupRes.data || !scoresRes.data)) {
        setState("needs_questionnaire");
        return;
      }

      setState("error");
    }

    load();
  }, [router]);

  if (state === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fishburners-500 border-t-transparent" />
      </div>
    );
  }

  if (state === "needs_questionnaire") {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Complete your Mission Briefing
        </h1>
        <p className="text-muted-foreground">
          We need a few quick answers before we can show your Fundraising
          Readiness Score and your personalised Command Center.
        </p>
        <Link
          href="/mission-briefing"
          className="inline-flex items-center justify-center rounded-md bg-fishburners-500 px-6 py-3 text-sm font-medium text-white hover:bg-fishburners-600"
        >
          Start Mission Briefing
        </Link>
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

      <div className="grid gap-6 md:grid-cols-2">
        <ReadinessRadar scores={data.scores} animate={animateScore} />
        <GapAnalysisCard scores={data.scores} />
      </div>

      <ActionItemsCard scores={data.scores} />

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSnapshot profile={data.profile} startup={data.startup} />
        <BenchmarkCard
          stage={data.startup.stage}
          overallScore={data.scores.overall_score}
        />
      </div>
    </div>
  );
}
