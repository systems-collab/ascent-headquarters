import type { QuestionnaireFormData } from "@/types/questionnaire";
import type { AmountRaised, FundingType, MonthlyRevenue } from "@/types/database";

interface StepProps {
  formData: QuestionnaireFormData;
  onChange: (updates: Partial<QuestionnaireFormData>) => void;
}

const AMOUNT_OPTIONS: { value: AmountRaised; label: string }[] = [
  { value: "under_50k", label: "Under $50k" },
  { value: "50k_250k", label: "$50k - $250k" },
  { value: "250k_1m", label: "$250k - $1M" },
  { value: "1m_5m", label: "$1M - $5M" },
  { value: "5m_plus", label: "$5M+" },
];

const FUNDING_TYPE_OPTIONS: { value: FundingType; label: string }[] = [
  { value: "bootstrapped", label: "Bootstrapped" },
  { value: "friends_family", label: "Friends & Family" },
  { value: "angel", label: "Angel" },
  { value: "vc", label: "Venture Capital" },
  { value: "grant", label: "Grant" },
  { value: "accelerator", label: "Accelerator" },
  { value: "debt", label: "Debt" },
  { value: "crowdfunding", label: "Crowdfunding" },
];

const REVENUE_OPTIONS: { value: MonthlyRevenue; label: string }[] = [
  { value: "pre_revenue", label: "Pre-revenue" },
  { value: "under_5k", label: "Under $5k/mo" },
  { value: "5k_20k", label: "$5k - $20k/mo" },
  { value: "20k_100k", label: "$20k - $100k/mo" },
  { value: "100k_plus", label: "$100k+/mo" },
];

export function StepFundingHistory({ formData, onChange }: StepProps) {
  const toggleFundingType = (ft: FundingType) => {
    const current = formData.funding_types;
    const next = current.includes(ft)
      ? current.filter((t) => t !== ft)
      : [...current, ft];
    onChange({ funding_types: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Funding History</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your funding journey so far.
        </p>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Have you raised funding before?</legend>
          <div className="flex gap-4">
            {([true, false] as const).map((val) => (
              <label key={String(val)} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="raised_before"
                  checked={formData.raised_before === val}
                  onChange={() => onChange({ raised_before: val })}
                  className="accent-fishburners-500"
                />
                {val ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>

        {formData.raised_before && (
          <>
            <div>
              <label htmlFor="amount_raised" className="text-sm font-medium">How much have you raised?</label>
              <select
                id="amount_raised"
                value={formData.amount_raised}
                onChange={(e) => onChange({ amount_raised: e.target.value as AmountRaised | "" })}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select amount</option>
                {AMOUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Funding types received</legend>
              <div className="grid grid-cols-2 gap-2">
                {FUNDING_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.funding_types.includes(opt.value)}
                      onChange={() => toggleFundingType(opt.value)}
                      className="accent-fishburners-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div>
          <label htmlFor="monthly_revenue" className="text-sm font-medium">Monthly Revenue</label>
          <select
            id="monthly_revenue"
            value={formData.monthly_revenue}
            onChange={(e) => onChange({ monthly_revenue: e.target.value as MonthlyRevenue | "" })}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select revenue range</option>
            {REVENUE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
