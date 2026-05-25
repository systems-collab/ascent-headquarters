"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProgressBar } from "@/components/questionnaire/progress-bar";
import { StepAboutYou } from "@/components/questionnaire/step-about-you";
import { StepYourStartup } from "@/components/questionnaire/step-your-startup";
import { StepStageTeam } from "@/components/questionnaire/step-stage-team";
import { StepFundingHistory } from "@/components/questionnaire/step-funding-history";
import { StepFundraisingReadiness } from "@/components/questionnaire/step-fundraising-readiness";
import { StepYourGoals } from "@/components/questionnaire/step-your-goals";
import {
  type QuestionnaireFormData,
  EMPTY_FORM,
  TOTAL_STEPS,
} from "@/types/questionnaire";
import {
  saveQuestionnaireData,
  loadQuestionnaireData,
} from "@/lib/questionnaire-storage";

const STEP_COMPONENTS = [
  StepAboutYou,
  StepYourStartup,
  StepStageTeam,
  StepFundingHistory,
  StepFundraisingReadiness,
  StepYourGoals,
];

export default function MissionBriefingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireFormData>(EMPTY_FORM);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFormData(loadQuestionnaireData());
    setLoaded(true);
  }, []);

  const handleChange = useCallback(
    (updates: Partial<QuestionnaireFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };
        saveQuestionnaireData(next);
        return next;
      });
    },
    [],
  );

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      saveQuestionnaireData(formData);
      router.push("/mission-briefing/results");
    }
  };

  const CurrentStep = STEP_COMPONENTS[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <ProgressBar currentStep={step} />

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <CurrentStep formData={formData} onChange={handleChange} />

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-fishburners-500 px-5 py-2 text-sm font-medium text-white hover:bg-fishburners-600"
              >
                {isLastStep ? "See My Results" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
