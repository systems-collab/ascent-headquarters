import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { TriState, Confidence, AuLandscape } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

const TRI_STATE_OPTIONS: { value: TriState; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "in_progress", label: "In progress" },
  { value: "no", label: "No" },
];

const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: "confident", label: "Confident" },
  { value: "somewhat", label: "Somewhat" },
  { value: "not_yet", label: "Not yet" },
];

const LANDSCAPE_OPTIONS: { value: AuLandscape; label: string }[] = [
  { value: "strong", label: "Strong" },
  { value: "moderate", label: "Moderate" },
  { value: "limited", label: "Limited" },
];

export function StepFundraisingReadiness({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fundraising Readiness</h2>
        <p className="mt-1 text-sm text-gray-500">
          How prepared are you for the fundraising process?
        </p>
      </div>

      <div className="space-y-5">
        <RadioGroup
          label="Do you have a pitch deck?"
          name="has_pitch_deck"
          options={TRI_STATE_OPTIONS}
          value={formData.has_pitch_deck}
          onChange={(v) => onChange({ has_pitch_deck: v as TriState })}
        />
        <RadioGroup
          label="Do you have a financial model?"
          name="has_financial_model"
          options={TRI_STATE_OPTIONS}
          value={formData.has_financial_model}
          onChange={(v) => onChange({ has_financial_model: v as TriState })}
        />
        <RadioGroup
          label="Do you understand cap tables?"
          name="understands_cap_tables"
          options={CONFIDENCE_OPTIONS}
          value={formData.understands_cap_tables}
          onChange={(v) => onChange({ understands_cap_tables: v as Confidence })}
        />
        <RadioGroup
          label="Have you identified target investors?"
          name="identified_investors"
          options={CONFIDENCE_OPTIONS}
          value={formData.identified_investors}
          onChange={(v) => onChange({ identified_investors: v as Confidence })}
        />
        <RadioGroup
          label="How well do you know the AU funding landscape?"
          name="au_landscape_rating"
          options={LANDSCAPE_OPTIONS}
          value={formData.au_landscape_rating}
          onChange={(v) => onChange({ au_landscape_rating: v as AuLandscape })}
        />
      </div>
    </div>
  );
}

function RadioGroup<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: T; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-fishburners-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
