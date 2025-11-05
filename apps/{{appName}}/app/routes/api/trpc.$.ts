import { createTRPCContext } from "@repo/trpc/lib";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@repo/trpc/routers";

import type { Route } from "./+types/trpc.$";

import type { AppLoadContext } from "react-router";

const handler = async (req: Request, context: AppLoadContext) => {
  const authSession = await context.auth.api.getSession({
    headers: req.headers,
  });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        database: context.cloudflare.env.DATABASE,
        authApi: context.auth.api,
        auth: authSession,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });
};

export async function loader({ request, context }: Route.LoaderArgs) {
  return handler(request, context);
}

export async function action({ request, context }: Route.ActionArgs) {
  return handler(request, context);
}
