import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StoreNavbar } from "@/components/store/store-navbar";
import { StoreFooter } from "@/components/store/store-footer";

/** Layout persistente de la tienda: Navbar + contenido + Footer. */
export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  );
}
