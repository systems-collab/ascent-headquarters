import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) redirect("/command-center");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
