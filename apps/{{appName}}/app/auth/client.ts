import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Auth client for this app (with admin plugin)
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [adminClient()],
});
