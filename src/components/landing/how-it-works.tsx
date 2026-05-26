const STEPS = [
  {
    number: 1,
    title: "Take the Mission Briefing",
    description:
      "A 2-minute diagnostic that maps your fundraising readiness across five dimensions.",
  },
  {
    number: 2,
    title: "Get Your Readiness Score",
    description:
      "See where you stand on pitch prep, financial literacy, funding strategy, and more.",
  },
  {
    number: 3,
    title: "Access Your Command Center",
    description:
      "Your personalized dashboard with gap analysis and a clear path forward.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          How It Works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fishburners-100 text-lg font-bold text-fishburners-600">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
