import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { refresh } = await import("@/server/auth/auth.controller");
        const { errorResponse } = await import("@/server/auth/auth.middleware");
        try {
          return await refresh(request);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
