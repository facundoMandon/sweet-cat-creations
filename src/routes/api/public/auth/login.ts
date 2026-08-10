import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { login } = await import("@/server/auth/auth.controller");
        const { errorResponse } = await import("@/server/auth/auth.middleware");
        try {
          return await login(request);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
