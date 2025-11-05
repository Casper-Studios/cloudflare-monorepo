# Dependency Management

## Centralized React Versions

This monorepo uses a **centralized approach** for managing React and its types to prevent version conflicts and ensure consistency across all packages.

### Structure

#### Root Package (`package.json`)
The root `package.json` defines the **single source of truth** for React versions:

```json
{
  "devDependencies": {
    "@types/react": "^19.1.13",
    "@types/react-dom": "^19.1.9",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

#### Workspace Packages (`packages/*`)
Workspace packages (like `@repo/ui`, `@repo/trpc`) use **peerDependencies only**:

```json
{
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

This means:
- They don't bundle their own React
- They use the React version provided by the consuming application
- No duplicate React types across the monorepo

#### Apps (`apps/*`)
Applications inherit React from the root via workspace hoisting:
- No need to specify React in their `package.json`
- They automatically use the centralized version from root
- Ensures all apps use the exact same React version

### Benefits

1. **Single Source of Truth**: Update React version in one place (root `package.json`)
2. **No Type Conflicts**: Eliminates "Type X is not assignable to type X" errors
3. **Smaller Bundle Sizes**: React is hoisted and shared across all packages
4. **Easier Upgrades**: Change version once, applies everywhere
5. **Consistent Behavior**: All code uses the same React version

### Adding New Packages

When creating new workspace packages that use React:

1. **DO NOT** add React to `dependencies`
2. **DO** add React to `peerDependencies`:
   ```json
   {
     "peerDependencies": {
       "react": "^19"
     }
   }
   ```

### Upgrading React

To upgrade React across the entire monorepo:

1. Update the version in **root** `package.json`
2. Run `bun install`
3. That's it! All packages now use the new version

### Troubleshooting

If you encounter React type errors:

1. Delete all `node_modules` folders:
   ```bash
   rm -rf node_modules apps/*/node_modules packages/*/node_modules tooling/*/node_modules
   ```

2. Delete `bun.lock`:
   ```bash
   rm bun.lock
   ```

3. Reinstall:
   ```bash
   bun install
   ```

This ensures a clean dependency resolution with the centralized version.

