const STATS = [
  { value: "200+", label: "Founders Served" },
  { value: "66%", label: "Secured Funding" },
  { value: "90%", label: "Engagement Retention" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-white py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-bold text-fishburners-600">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
