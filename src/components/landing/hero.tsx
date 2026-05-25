import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-fishburners-500 to-fishburners-700 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Ascent Headquarters
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-fishburners-100">
          Your command center for fundraising readiness. Assess where you stand,
          identify your gaps, and chart your path to capital.
        </p>
        <div className="mt-10">
          <Link
            href="/mission-briefing"
            className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-fishburners-600 shadow-lg hover:bg-gray-50 transition-colors"
          >
            Begin Mission Briefing
          </Link>
        </div>
      </div>
    </section>
  );
}
