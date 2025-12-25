# Statsig Experiment Resolution Example

Minimal example demonstrating how to resolve A/B test variants using the Statsig SDK with Kontent.ai. Shows two patterns:

1. **Component in Rich Text** - Experiments embedded inline within rich text content
2. **Linked Items** - Experiments as linked items in a content type

## Prerequisites

- Statsig account with a **Client SDK Key** (from Project Settings → Keys & Environments)
- An existing experiment in Statsig to test with

## Quick Start

1. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

2. **Required**: Edit `.env` and configure both variables:
   - `VITE_STATSIG_CLIENT_KEY` - Your Statsig Client SDK Key
   - `VITE_EXPERIMENT_ID` - The ID of an experiment in your Statsig project

3. Install and run:
   ```bash
   pnpm i
   pnpm dev
   ```

> [!IMPORTANT]
> The application will not start without valid environment variables. Make sure to configure both values in your `.env` file before running.

## Pattern 1: Component in Rich Text

Use when experiments are embedded inline within article content.

**Resolution:**
1. Transform rich text to portable text using `transformToPortableText()`
2. Use `createExperimentAwareResolvers()` to create custom resolvers
3. The resolver detects experiment components and resolves them via Statsig

## Pattern 2: Linked Items

Use when experiments are part of a structured page layout and may be reused.

**Resolution:**
1. When iterating over the linked items, get the winning variant for each experiment from Statsig and only render the content from the winning variant

## How Variant Resolution Works

Both patterns use the same underlying resolution logic:

1. `StatsigProvider` initializes the SDK with a user ID (persisted in localStorage)
2. Extract the experiment ID from `statsig_a_b_testing.value`
3. Call `client.getExperiment(id)` to get the assigned variant
4. Statsig returns `control` or `test` based on user ID
5. Render content from the winning variant's linked items

> [!TIP]
> **Terminology note**: The term "winning variant" refers to the variant assigned to the current user during an active experiment. Statsig deterministically assigns each user to a variant based on their user ID, ensuring they always see the same experience. This is different from Kontent.ai language variants - here "variant" refers to the experiment groups (control/test).

## Setting up Kontent.ai Content

This example uses mock data by default. To test with real Kontent.ai content, you can import the experiment content type and sample items using the [Kontent.ai Data-Ops CLI](https://github.com/kontent-ai/data-ops).

### Prerequisites

- A Kontent.ai environment with Management API access
- The deployed custom element URL (see [main project README](../README.md))

### Import Content Type

1. Update the `source_url` in `data-ops-backup/content-types/statsig_experiment.json` with your deployed custom element URL

2. Import the content type:
   ```bash
   pnpm import:content-type
   ```

   Or manually:
   ```bash
   npx @kontent-ai/data-ops@latest environment import \
     --environmentId <YOUR_ENVIRONMENT_ID> \
     --apiKey <YOUR_MANAGEMENT_API_KEY> \
     --fileName data-ops-backup/content-types/statsig_experiment.json
   ```

### Import Sample Content (Optional)

After importing the content type, you can import a sample experiment:

```bash
pnpm import:content
```

Or manually:
```bash
npx @kontent-ai/data-ops@latest environment import \
  --environmentId <YOUR_ENVIRONMENT_ID> \
  --apiKey <YOUR_MANAGEMENT_API_KEY> \
  --fileName data-ops-backup/content-items/sample_experiment.json
```

> [!NOTE]
> The sample experiment uses placeholder values. After importing, update the experiment ID to match your Statsig experiment and add content items to the control/test linked items.
