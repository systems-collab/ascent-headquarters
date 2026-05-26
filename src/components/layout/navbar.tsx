import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-fishburners-600">
          Ascent HQ
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/mission-briefing"
            className="text-sm font-medium text-gray-700 hover:text-fishburners-600"
          >
            Mission Briefing
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-fishburners-500 px-4 py-2 text-sm font-medium text-white hover:bg-fishburners-600"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
