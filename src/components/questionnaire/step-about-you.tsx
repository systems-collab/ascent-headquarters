import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOCATION_LABELS } from "@/lib/constants";
import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { AuLocation } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

export function StepAboutYou({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">About You</h2>
        <p className="mt-1 text-sm text-gray-500">
          Let us know who you are so we can personalise your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder="Jane Smith"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="jane@startup.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => onChange({ location: e.target.value as AuLocation | "" })}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select your state or territory</option>
            {(Object.entries(LOCATION_LABELS) as [AuLocation, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
