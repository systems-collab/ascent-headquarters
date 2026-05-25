"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/command-center", label: "Command Center" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-fishburners-600">
          Ascent HQ
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              pathname === item.href
                ? "bg-fishburners-50 text-fishburners-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
