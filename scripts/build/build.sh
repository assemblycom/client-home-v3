#!/usr/bin/env bash
set -Eeuo pipefail

echo "👷 Running build script for environment: ${VERCEL_ENV:-local}"

# Validate that all required environment variables are set for environment
pnpm ex scripts/build/validate-env.ts
echo "🎉 Environment variables are valid"
echo "--------------------------------------------"

# Apply database migrations
# pnpm drizzle-kit migrate
# echo "\n🎉 Database migrations applied\n"
# echo "--------------------------------------------"

# Build the project with turbopack
pnpm build
echo "🎊 Project built successfully!"
echo "--------------------------------------------"
