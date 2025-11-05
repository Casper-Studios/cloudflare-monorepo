import { createTRPCContext } from "@repo/trpc/lib";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@repo/trpc/routers";
import { getDb } from "@repo/db";

import type { Route } from "./+types/trpc.$";

import type { AppLoadContext } from "react-router";
import type { User } from "@repo/auth";

const handler = async (req: Request, context: AppLoadContext) => {
  const authSession = await context.auth.api.getSession({
    headers: req.headers,
  });

  const database = getDb(context.cloudflare.env.DATABASE);

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        database,
        authApi: context.auth.api,
        auth: authSession
          ? {
              session: authSession.session,
              user: authSession.user as User & { role: "user" | "admin" },
            }
          : null,
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
