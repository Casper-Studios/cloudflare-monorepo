# Cloudflare Monorepo

A full-stack TypeScript monorepo built on Cloudflare's infrastructure, featuring a React Router server application, Expo mobile app, and Nextra documentation site.

## 🚀 Tech Stack

### Apps

- **`server`** - React Router v7 app running on Cloudflare Workers with:
  - D1 (SQLite) database
  - R2 (Object Storage) for file uploads
  - Workflows for background jobs
  - AI bindings for ML models
  - Better Auth for authentication
- **`mobile`** - Expo/React Native mobile app with tRPC integration
- **`docs`** - Nextra documentation site

### Shared Packages

- **`@{project}/auth`** - Better Auth configuration and utilities
- **`@{project}/db`** - Drizzle ORM schema and database client
- **`@{project}/trpc`** - tRPC API routers and type-safe client
- **`@{project}/repositories`** - Data access layer and business logic
- **`@{project}/schemas`** - Zod validation schemas
- **`@{project}/ui`** - Shared React components (shadcn/ui)

### Tooling

- **Turborepo** - Build system and monorepo orchestration
- **Bun** - Fast package manager and runtime
- **TypeScript** - Type safety across the entire stack
- **Drizzle ORM** - Type-safe SQL query builder
- **tRPC** - End-to-end type-safe APIs
- **Better Auth** - Modern authentication library

## 📋 Prerequisites

- [Bun](https://bun.sh) (v1.3.0 or higher)
- [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (installed globally)

Make sure you're logged in to Wrangler:

```bash
wrangler login
```

## 🎯 First-Time Setup

The first thing you should do after cloning this repository is run the interactive setup script:

```bash
bun run setup
```

This script will:

1. **Configure Your Project**
   - Prompt for a project name
   - Update all package references from `@repo/*` to `@{your-project}/*`
   - Configure resource names (database, buckets, etc.)

2. **Create Cloudflare Resources**
   - D1 database for SQLite storage
   - R2 bucket for object storage
   - KV namespace (optional)

3. **Set Up Authentication**
   - Generate secure `BETTER_AUTH_SECRET`
   - Create `.env` files in root and `apps/server`

4. **Configure Wrangler**
   - Create `apps/server/wrangler.jsonc` with your resource bindings
   - Remove `wrangler.jsonc` from `.gitignore`

5. **Run Database Migrations**
   - Generate initial migrations
   - Apply migrations to local and remote D1 databases

6. **Optional Deployment**
   - Upload secrets to Cloudflare Workers
   - Build and deploy your application

After setup completes, all configuration files will be customized for your project and ready for development.

## 🛠️ Development

### Start All Development Servers

```bash
bun run dev
```

This command runs all apps in parallel using Turborepo's task orchestration. Here's what happens:

1. **`cf-typegen`** - Generates TypeScript types from `wrangler.jsonc` bindings
2. **`db:copy-migrations`** - Copies database migrations from `packages/db/drizzle/` to `apps/server/migrations/`
   - This ensures your server has the latest schema changes
   - Migrations must be in the server app directory for Wrangler to apply them
3. **`db:migrate:local`** - Applies pending migrations to your local D1 database
4. **Start dev servers**:
   - `server` on http://localhost:8787
   - `mobile` Metro bundler
   - `docs` on http://localhost:3000

The migration copy step is crucial because:
- Database schemas are defined in `packages/db/schema/`
- Drizzle generates migrations in `packages/db/drizzle/`
- Wrangler needs migrations in `apps/server/migrations/` to apply them to D1
- The copy step keeps them in sync automatically

### Start Individual Apps

```bash
# Server only
bun run dev:server

# Mobile only
cd apps/mobile && bun run dev

# Docs only
cd apps/docs && bun run dev
```

### Database Commands

```bash
# Generate new migration after schema changes
bun run db:generate

# Open Drizzle Studio to browse your database
bun run db:studio

# Apply migrations to local D1 database
bun run db:migrate:local

# Apply migrations to remote D1 database
bun run db:migrate:remote

# Manually copy migrations (usually automatic during dev)
bun run db:copy-migrations
```

### Working with the Database

1. **Define your schema** in `packages/db/schema/`:

```typescript
// packages/db/schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

2. **Generate a migration**:

```bash
bun run db:generate
```

3. **Apply migrations** (happens automatically during `bun run dev`):

```bash
bun run db:migrate:local
```

4. **Use in repositories** (`packages/repositories/src/`):

```typescript
import { db } from "@{project}/db";
import { users } from "@{project}/db/schema";

export async function createUser(email: string) {
  return db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    createdAt: new Date(),
  });
}
```

### Adding UI Components

This monorepo uses shadcn/ui components in the `@{project}/ui` package:

```bash
bun run ui-add
```

This will prompt you to select components to add. They'll be added to `packages/ui/src/` and can be imported from `@{project}/ui`.

## 🏗️ Architecture

### Data Flow

```
Mobile App (Expo)
    ↓ tRPC
Server (React Router + Workers)
    ↓ Repositories
Database (D1) + Storage (R2)
```

### Authentication Flow

1. Client (mobile/web) initiates auth with Better Auth
2. Better Auth handles OAuth providers or email/password
3. Session stored in D1 database
4. Subsequent requests authenticated via session token
5. Protected tRPC routes verify session

### File Uploads

1. Client requests signed upload URL from tRPC endpoint
2. Server generates presigned R2 URL
3. Client uploads directly to R2
4. Client notifies server of upload completion
5. Server stores metadata in D1

### Background Jobs

Use Cloudflare Workflows for long-running tasks:

```typescript
// apps/server/workflows/example.ts
export default class ExampleWorkflow extends Workflow {
  async run(event: any, step: Step) {
    await step.do("process", async () => {
      // Your background job logic
    });
  }
}
```

Trigger from your application:

```typescript
// In a tRPC route or request handler
await env.EXAMPLE_WORKFLOW.create({
  params: { userId: "123" },
});
```

## 🚀 Deployment

### Deploy to Production

```bash
bun run deploy
```

This will:
1. Copy migrations to the server app
2. Apply migrations to remote D1 database
3. Build the server application
4. Deploy to Cloudflare Workers

### Set Production Secrets

Secrets are not stored in `wrangler.jsonc` and must be set via Wrangler:

```bash
cd apps/server
echo "your-secret-value" | wrangler secret put BETTER_AUTH_SECRET
```

### Environment Variables

- **Local development**: Use `.env` files (not committed to git)
- **Production**: Use `wrangler secret put` for sensitive values
- **Public variables**: Add to `wrangler.jsonc` under `vars`

## 📱 Mobile Development

### iOS

```bash
cd apps/mobile
bun run ios
```

### Android

```bash
cd apps/mobile
bun run android
```

### Configure API URL

The mobile app connects to your server via the `EXPO_PUBLIC_API_URL` environment variable:

```bash
# .env (root)
EXPO_PUBLIC_API_URL=http://localhost:8787  # Local development
# or
EXPO_PUBLIC_API_URL=https://your-worker.workers.dev  # Production
```

## 📚 Documentation

The `docs` app uses Nextra for a beautiful documentation site. Add MDX files to `apps/docs/app/` and they'll automatically be added to the navigation.

## 🧪 Testing & Linting

```bash
# Run tests across all packages
bun test

# Type checking
bun run check-types

# Linting (all packages/apps use unified configs from /tooling)
bun run lint

# Format code
bun run format
```

### ESLint & TypeScript Configuration

This monorepo uses centralized ESLint and TypeScript configurations from the `/tooling` directory:

- **`tooling/eslint-config/`** - Unified ESLint configurations:
  - `base.js` - Base config for all packages
  - `next-js.js` - Next.js applications (docs)
  - `react-internal.js` - React component libraries (ui)
  - `react-native.js` - React Native/Expo apps (mobile, server)

- **`tooling/typescript-config/`** - Unified TypeScript configurations:
  - `base.json` - Base TypeScript config
  - `nextjs.json` - Next.js applications
  - `react.json` - React applications
  - `react-library.json` - React component libraries

All apps and packages automatically inherit these configurations and follow consistent linting and type-checking standards.

## 📦 Adding Dependencies

### Workspace Root

```bash
bun add <package> -D  # Development dependency
```

### Specific Package

```bash
cd packages/db
bun add drizzle-orm
```

### Workspace Dependencies

Packages can depend on each other via workspace protocol:

```json
{
  "dependencies": {
    "@{project}/db": "workspace:*"
  }
}
```

## 🔧 Troubleshooting

### Migrations not applying

If migrations aren't applying during `bun run dev`:

1. Check that migrations exist in `packages/db/drizzle/`
2. Manually run `bun run db:copy-migrations`
3. Run `bun run db:migrate:local`

### Type errors after adding dependencies

Turborepo caches build outputs. Clear the cache:

```bash
rm -rf node_modules/.cache
bun run build
```

### Wrangler authentication issues

Re-authenticate with Cloudflare:

```bash
wrangler logout
wrangler login
```

### Local D1 database reset

Delete the local database and re-run migrations:

```bash
cd apps/server
rm -rf .wrangler
bun run db:migrate:local
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `bun run check-types` and `bun run lint`
4. Submit a pull request

## 📄 License

[Your License Here]

## 🔗 Useful Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [React Router v7 Docs](https://reactrouter.com/)
- [Expo Docs](https://docs.expo.dev/)
- [Nextra Docs](https://nextra.site/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [tRPC Docs](https://trpc.io/)
- [Better Auth Docs](https://better-auth.com/)
- [Turborepo Docs](https://turbo.build/repo/docs)
