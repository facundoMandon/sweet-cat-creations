import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { logout } = await import("@/server/auth/auth.controller");
        const { errorResponse } = await import("@/server/auth/auth.middleware");
        try {
          return await logout(request);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
