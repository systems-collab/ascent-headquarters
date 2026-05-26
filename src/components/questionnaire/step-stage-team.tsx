import { STAGE_LABELS } from "@/lib/constants";
import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { Stage, TeamSize } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

const TEAM_SIZE_OPTIONS: { value: TeamSize; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "2_3", label: "2-3" },
  { value: "4_10", label: "4-10" },
  { value: "11_plus", label: "11+" },
];

export function StepStageTeam({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stage & Team</h2>
        <p className="mt-1 text-sm text-gray-500">
          Where is your startup at right now?
        </p>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Stage</legend>
          <div className="space-y-2">
            {(Object.entries(STAGE_LABELS) as [Stage, string][]).map(
              ([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="stage"
                    value={value}
                    checked={formData.stage === value}
                    onChange={() => onChange({ stage: value })}
                    className="accent-fishburners-500"
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Team Size</legend>
          <div className="flex flex-wrap gap-3">
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="team_size"
                  value={opt.value}
                  checked={formData.team_size === opt.value}
                  onChange={() => onChange({ team_size: opt.value })}
                  className="accent-fishburners-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Do you have a co-founder?</legend>
          <div className="flex gap-4">
            {([true, false] as const).map((val) => (
              <label key={String(val)} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="has_cofounder"
                  checked={formData.has_cofounder === val}
                  onChange={() => onChange({ has_cofounder: val })}
                  className="accent-fishburners-500"
                />
                {val ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
