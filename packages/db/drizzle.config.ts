import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function getLocalD1DB() {
  try {
    const basePath = path.resolve(
      "../../apps/{{appName}}/.wrangler/state/v3/d1"
    );
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"))
      .map((f) => ({
        path: f,
        fullPath: path.resolve(basePath, f),
        mtime: fs.statSync(path.resolve(basePath, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const latestFile = files[0];

    if (!latestFile) {
      throw new Error("No database file found");
    }

    console.log(`Using latest D1 database: ${latestFile.path}`);
    return latestFile.fullPath;
  } catch (err) {
    console.log(`Error  ${err}`);
  }
}
console.log(process.env.NODE_ENV);

export default defineConfig({
  out: "./drizzle",
  schema: "./schema/index.ts",
  dialect: "sqlite",
  ...(process.env.NODE_ENV === "production"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
          databaseId: process.env.DATABASE,
          token: process.env.CLOUDFLARE_D1_API_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
});
