import { Sidebar } from "@/components/layout/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
