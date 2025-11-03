import type { Database } from "@repo/db";

interface GetUserPayload {
  id: number;
}

export function getUser(db: Database, payload: GetUserPayload) {
  return db.query.usersTable.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.id, payload.id),
  });
}
