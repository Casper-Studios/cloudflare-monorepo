import type { Database } from "@repo/db";

interface GetUserPayload {
  id: string;
}

export function getUser(db: Database, payload: GetUserPayload) {
  return db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, payload.id),
  });
}
