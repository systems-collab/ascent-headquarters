"use client";

import { useEffect, useState } from "react";
import { ASCENT_PHASES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ReadinessScore } from "@/types/database";

function getRecommendedPhase(overallScore: number): (typeof ASCENT_PHASES)[number] {
  if (overallScore < 30) return ASCENT_PHASES[0];
  if (overallScore < 50) return ASCENT_PHASES[1];
  if (overallScore < 70) return ASCENT_PHASES[2];
  return ASCENT_PHASES[3];
}

export default function LaunchpadPage() {
  const [scores, setScores] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // readiness_scores has UNIQUE(founder_id), so maybeSingle() returns the
        // row when it exists or null without throwing PGRST116.
        const { data } = await supabase
          .from("readiness_scores")
          .select("*")
          .eq("founder_id", user.id)
          .maybeSingle();

        if (data) {
          setScores(data as ReadinessScore);
        }
      }

      setLoading(false);
    }

    fetchScores();
  }, []);

  const recommended = scores ? getRecommendedPhase(scores.overall_score) : null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          What is Ascent?
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Ascent is Fishburners' structured fundraising curriculum. It takes
          founders from zero to investor-ready across six phases, covering
          everything from capital basics to post-raise growth.
        </p>
      </section>

      {/* Phase timeline */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Phase Timeline
        </h2>
        <div className="relative">
          {ASCENT_PHASES.map((phase, index) => {
            const isRecommended = recommended?.number === phase.number;
            const isLast = index === ASCENT_PHASES.length - 1;

            return (
              <div key={phase.number} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Connecting line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 h-full w-0.5 bg-fishburners-200" />
                )}

                {/* Numbered circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isRecommended
                      ? "bg-fishburners-500 text-white ring-4 ring-fishburners-200"
                      : "bg-fishburners-100 text-fishburners-700"
                  }`}
                >
                  {phase.number}
                </div>

                {/* Phase content */}
                <div
                  className={`rounded-lg border p-4 flex-1 ${
                    isRecommended
                      ? "border-fishburners-300 bg-fishburners-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {phase.description}
                  </p>
                  {isRecommended && (
                    <span className="mt-2 inline-block rounded-full bg-fishburners-500 px-3 py-0.5 text-xs font-medium text-white">
                      Recommended for you
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended starting point */}
      <section className="mb-10 rounded-lg border border-fishburners-200 bg-fishburners-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recommended Starting Point
        </h2>
        {loading ? (
          <p className="mt-2 text-sm text-gray-500">
            Loading your recommendation...
          </p>
        ) : recommended ? (
          <p className="mt-2 text-gray-700">
            Based on your Mission Briefing, we recommend starting at{" "}
            <span className="font-semibold text-fishburners-700">
              Phase {recommended.number}: {recommended.title}
            </span>
            .
          </p>
        ) : (
          <p className="mt-2 text-gray-700">
            Complete the{" "}
            <a
              href="/mission-briefing"
              className="font-medium text-fishburners-600 underline hover:text-fishburners-700"
            >
              Mission Briefing
            </a>{" "}
            to get a personalised starting point recommendation.
          </p>
        )}
      </section>

      {/* CTAs */}
      <section className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-md bg-fishburners-500 px-6 py-3 text-sm font-medium text-white hover:bg-fishburners-600"
        >
          Access the Ascent Curriculum
        </a>
        <a
          href="mailto:hello@fishburners.org"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Talk to the Ascent team
        </a>
      </section>
    </div>
  );
}
