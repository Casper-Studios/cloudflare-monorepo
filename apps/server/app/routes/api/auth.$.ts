import { createAuth } from "@repo/auth";
import type { Route } from "./+types/auth.$";
import { getDb } from "@repo/db";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = await createAuth(getDb(context.cloudflare.env.DATABASE), {
    secret: context.cloudflare.env.BETTER_AUTH_SECRET,
  });
  return auth.handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  const auth = await createAuth(getDb(context.cloudflare.env.DATABASE), {
    secret: context.cloudflare.env.BETTER_AUTH_SECRET,
  });
  return auth.handler(request);
}
