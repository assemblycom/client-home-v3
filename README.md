# Client Home

## Local Development

### Prerequisites

- Node.js
- [pnpm](https://pnpm.io/) (v10.30.2+ — enforced via `packageManager` in `package.json`)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd client-home
pnpm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

Fill in the required values in `.env`.

3. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Auto-fix lint/format issues |
