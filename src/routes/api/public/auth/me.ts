import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { me } = await import("@/server/auth/auth.controller");
        const { errorResponse } = await import("@/server/auth/auth.middleware");
        try {
          return await me(request);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
