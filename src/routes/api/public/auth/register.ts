import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { register } = await import("@/server/auth/auth.controller");
        const { errorResponse } = await import("@/server/auth/auth.middleware");
        try {
          return await register(request);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
