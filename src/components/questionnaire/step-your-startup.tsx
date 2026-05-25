import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SECTOR_LABELS } from "@/lib/constants";
import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { Sector } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

export function StepYourStartup({ formData, onChange }: StepProps) {
  const charCount = formData.description.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Startup</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about what you are building.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="startup_name">Startup Name</Label>
          <Input
            id="startup_name"
            value={formData.startup_name}
            onChange={(e) => onChange({ startup_name: e.target.value })}
            placeholder="My Startup"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="sector">Sector</Label>
          <select
            id="sector"
            value={formData.sector}
            onChange={(e) => onChange({ sector: e.target.value as Sector | "" })}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select a sector</option>
            {(Object.entries(SECTOR_LABELS) as [Sector, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <Label htmlFor="description">One-line Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              if (e.target.value.length <= 140) {
                onChange({ description: e.target.value });
              }
            }}
            placeholder="What does your startup do in one sentence?"
            rows={2}
            className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1 text-xs text-gray-400">{charCount}/140</p>
        </div>
      </div>
    </div>
  );
}
