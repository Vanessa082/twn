import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (_error) {
    redirect("/?error=forbidden");
  }

  return (
    <ClerkProvider>
      <div className="flex min-h-screen bg-muted/30 text-foreground transition-colors duration-300 font-sans">
        <AdminSidebar />

        <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ClerkProvider>
  );
}
