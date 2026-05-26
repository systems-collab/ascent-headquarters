import { PATHWAY_LABELS, CHALLENGE_LABELS } from "@/lib/constants";
import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { FundingPathway, BiggestChallenge, TargetRaise } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

const TARGET_RAISE_OPTIONS: { value: TargetRaise; label: string }[] = [
  { value: "under_100k", label: "Under $100k" },
  { value: "100k_500k", label: "$100k - $500k" },
  { value: "500k_2m", label: "$500k - $2M" },
  { value: "2m_10m", label: "$2M - $10M" },
  { value: "10m_plus", label: "$10M+" },
  { value: "not_sure", label: "Not sure yet" },
];

export function StepYourGoals({ formData, onChange }: StepProps) {
  const togglePathway = (pw: FundingPathway) => {
    const current = formData.target_pathways;
    const next = current.includes(pw)
      ? current.filter((p) => p !== pw)
      : [...current, pw];
    onChange({ target_pathways: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        <p className="mt-1 text-sm text-gray-500">
          What are you aiming for with your next raise?
        </p>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Funding pathways you are interested in</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(PATHWAY_LABELS) as [FundingPathway, string][]).map(
              ([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.target_pathways.includes(value)}
                    onChange={() => togglePathway(value)}
                    className="accent-fishburners-500"
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Biggest challenge right now</legend>
          <div className="space-y-2">
            {(Object.entries(CHALLENGE_LABELS) as [BiggestChallenge, string][]).map(
              ([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="biggest_challenge"
                    value={value}
                    checked={formData.biggest_challenge === value}
                    onChange={() => onChange({ biggest_challenge: value })}
                    className="accent-fishburners-500"
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </fieldset>

        <div>
          <label htmlFor="target_raise" className="text-sm font-medium">Target raise amount</label>
          <select
            id="target_raise"
            value={formData.target_raise}
            onChange={(e) => onChange({ target_raise: e.target.value as TargetRaise | "" })}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select target amount</option>
            {TARGET_RAISE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
