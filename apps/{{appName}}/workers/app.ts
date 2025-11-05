import { createRequestHandler } from "react-router";
import { appRouter } from "@repo/trpc/routers";
import { createAuth, type Auth } from "@repo/auth";
import { createCallerFactory, createTRPCContext } from "@repo/trpc/lib";

const createCaller = createCallerFactory(appRouter);

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    trpc: ReturnType<typeof createCaller>;
    auth: Auth;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export { ExampleWorkflow } from "../workflows/example";

export default {
  async fetch(request, env, ctx) {
    const auth = await createAuth(env.DATABASE, {
      secret: env.BETTER_AUTH_SECRET,
    });

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const trpcContext = await createTRPCContext({
      headers: request.headers,
      database: env.DATABASE,
      auth: session,
      authApi: auth.api,
    });

    const trpcCaller = createCaller(trpcContext);

    return requestHandler(request, {
      cloudflare: { env, ctx },
      trpc: trpcCaller,
      auth,
    });
  },
} satisfies ExportedHandler<Env>;
