# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code), Antigravity, and any other AI coding agents when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm typecheck    # TypeScript type checking
pnpm lint         # Biome linting
pnpm format       # Biome formatting (auto-fix)
```

Database migrations (Drizzle):
```bash
pnpm drizzle-kit generate   # Generate migration from schema changes
pnpm drizzle-kit migrate    # Apply migrations
pnpm drizzle-kit push       # Push schema directly (dev only)
```

Run TypeScript scripts:
```bash
pnpm ex scripts/path/to/script.ts
```

## Architecture Overview

**Stack**: Next.js 16 (App Router) + React 19 + Drizzle ORM + PostgreSQL (Supabase) + TipTap Editor

### Feature Module Structure

Code is organized by feature under `src/features/`. Each feature contains:
- `lib/` - Backend-related code like controllers, services, repositories, schemas, types, etc
- `components/` - React components
- `hooks/` - Custom hooks
- `stores/` - Zustand stores
- `providers/` - Context providers

Key features: `auth`, `settings`, `editor`, `media`, `workspace`, `users`

### Service/Repository Pattern

Services extend `BaseService` and receive User + AssemblyClient. Repositories implement interfaces extending `BaseRepository`. Drizzle repositories extend `BaseDrizzleRepository` for transaction support.

```typescript
// Service instantiation pattern
const service = SettingsService.new(user);
await service.getSettings(workspaceId);

// Repository injection
class SettingsService extends BaseService {
  constructor(user: User, client: AssemblyClient, private repo: SettingsRepository) {
    super(user, client);
  }
}
```

### Database

- Schemas defined in feature modules: `src/features/**/*.schema.ts`
- Migrations at `src/db/migrations/` with timestamp prefix
- Snake case in DB, camelCase in TypeScript
- Singleton Drizzle instance at `src/db/db.ts`

### State Management

- **Server state**: TanStack React Query (dehydrated SSR → hydrated client)
- **Client state**: Zustand stores per feature
- Providers wrap app: AuthProvider, SettingsProvider, AppProvider

### API Routes

All routes wrapped with `withErrorHandler()` for consistent error handling. Located at `src/app/api/`.

Custom error classes in `src/errors/`: APIError, NotFoundError, UnauthorizedError (each with HTTP status code).

### Path Aliases

```
@auth/*, @settings/*, @editor/*, @media/*, @users/*, @workspace/*
@common/*, @app-bridge/*, @assembly/*, @extensions/*
@/* (root src)
```

### Backend-specific guidelines

- The backend specific code in `lib/` uses a minimal dependency injection pattern and a minimal implementation of CLEAN architecture (only entity, repository, schema, dto, controller - all under the same folder).
- Inside `lib/`, there must be folder, each revolving around a particular resource in the feature. E.g. `features/settings/lib/` contains two folders `settings/` and `actions/`, each which revolve around a particular entity / resource.
- All services must expose a static method "new" which bootstraps the service and its dependencies.
- All services must be stateless and should not store any data in memory.
- All repositories must expose an interface that the service can use.
- A drizzle implementation of the repository must be created for each repository interface.
- All repositories must be injected into the service.
- All repositories must be transaction aware (use drizzle transactions).

## Code Quality

- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **Commits**: Conventional commits enforced (feat, fix, chore, etc.)
- **Pre-commit**: Husky + lint-staged runs Biome checks
- **TypeScript**: Strict mode enabled
- Prefer arrow functions over traditional functions
- Use modern JS / TS syntax for everything
- Use async/await instead of .then() and .catch()
- No semicolons

## PR Requirements

PRs require: changes description, testing criteria with Loom video, and impact analysis (see `.github/PULL_REQUEST_TEMPLATE.md`).
