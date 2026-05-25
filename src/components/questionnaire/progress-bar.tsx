import { TOTAL_STEPS } from "@/types/questionnaire";

const STEP_NAMES = [
  "About You",
  "Your Startup",
  "Stage & Team",
  "Funding History",
  "Fundraising Readiness",
  "Your Goals",
];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Step {currentStep} of {TOTAL_STEPS}: {STEP_NAMES[currentStep - 1]}
        </span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-fishburners-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
