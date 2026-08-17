import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { seoMeta } from "@/config";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: seoMeta("admin") }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <ProtectedRoute requireRole="admin">
      <div className="flex min-h-screen flex-col bg-muted/40 lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
