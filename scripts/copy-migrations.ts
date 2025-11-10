#!/usr/bin/env bun
import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Static app name - server is the only app that uses migrations
const appName = "server";

// Paths relative to monorepo root
const sourceDir = join(__dirname, "..", "packages", "db", "drizzle");
const targetDir = join(__dirname, "..", "apps", appName, "migrations");

// Check if source directory exists
if (!existsSync(sourceDir)) {
  console.error(`❌ Error: Source directory not found: ${sourceDir}`);
  process.exit(1);
}

// Check if app directory exists
const appDir = join(__dirname, "..", "apps", appName);
if (!existsSync(appDir)) {
  console.error(`❌ Error: App directory not found: ${appDir}`);
  console.error(`   Looking for: ${appDir}`);
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

// Copy all files from source to target
try {
  cpSync(sourceDir, targetDir, { recursive: true });

  // Count the files copied
  const countFiles = (dir: string): number => {
    let count = 0;
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      if (statSync(fullPath).isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
    return count;
  };

  const fileCount = countFiles(targetDir);

  console.log(`✅ Successfully copied migrations to ${appName}`);
  console.log(`   Source: ${sourceDir}`);
  console.log(`   Target: ${targetDir}`);
  console.log(`   Files: ${fileCount}`);
} catch (error) {
  console.error(`❌ Error copying migrations:`, error);
  process.exit(1);
}
