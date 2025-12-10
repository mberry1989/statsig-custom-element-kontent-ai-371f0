# Statsig Experiment Resolution Example

Minimal example demonstrating how to resolve A/B test variants using the Statsig SDK with Kontent.ai rich text resolver.

## Prerequisites

- Statsig account with a **Client SDK Key** (from Project Settings → Keys & Environments)
- An existing experiment in Statsig to test with

## Quick Start

```bash
cp .env.template .env
# Edit .env and add your VITE_STATSIG_CLIENT_KEY and VITE_EXPERIMENT_ID
pnpm i
pnpm dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Wraps the app with `StatsigProvider` using a stable user ID |
| `src/App.tsx` | Resolves experiment variant via `useStatsigClient()` hook |
| `src/experimentResolver.tsx` | Rich text resolver that handles `experiment` content type |

## How It Works

1. `StatsigProvider` initializes the SDK with a user ID (persisted in localStorage)
2. Rich text containing an experiment component is transformed to portable text
3. The custom resolver detects `experiment` content type and calls `client.getExperiment(id)`
4. Statsig returns the assigned variant (`control` or `test`) based on user ID
5. The custom resolver renders only the element of the winning variant from the experiment item
