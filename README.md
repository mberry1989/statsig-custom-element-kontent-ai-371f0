# Statsig A/B Testing Custom Element for Kontent.ai

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/JiriLojda/statsig-custom-element-kontent-ai)

A [Custom Element](https://kontent.ai/learn/docs/custom-elements) for easy A/B testing with Kontent.ai and [Statsig](https://statsig.com/).

![Statsig A/B Testing Custom Element for Kontent.ai](./docs/diagram.png)

## How the Integration Works

### 1. Content Modeling in Kontent.ai

Create an **Experiment** content type with three elements:

| Element | Type | Purpose |
|---------|------|---------|
| `statsig_a_b_testing` | Custom element (this one) | Stores the Statsig experiment ID |
| `control` | Linked items | Content shown to users in the control group |
| `test` | Linked items | Content shown to users in the test group |

### 2. Statsig Experiment Setup

The Statsig experiment must have exactly **two variants**, each with a parameter named `variant`:
- First variant: `variant` = `control`
- Second variant: `variant` = `test`

When you create an experiment through this custom element, it automatically configures this for you with a 50/50 split.

### 3. Connecting Content to Experiments

Use the custom element to either:
- **Create a new experiment** in Statsig directly from Kontent.ai
- **Link an existing experiment** from your Statsig project

The custom element stores the experiment ID in its value (as JSON: `{ "experimentId": "..." }`), creating the connection between your content item and the Statsig experiment.

### 4. Frontend Resolution

When your frontend app renders content containing an experiment:

1. Read the experiment ID from the custom element's value
2. Call Statsig SDK with the experiment ID and current user ID
3. Statsig returns the winning variant (`control` or `test`) based on user assignment
4. Render only the linked items from the winning variant, ignore the other

See the [`example/`](./example/) folder for a minimal frontend implementation showing how to resolve experiment variants using the Statsig SDK with Kontent.ai rich text.

## Prerequisites

Before running this custom element, you need:

1. **Statsig Account** - Sign up at [statsig.com](https://statsig.com/)
2. **Statsig Console API Key** - Generate one from Statsig Console → Project Settings → API Keys → Console API Key (only accessed in Netlify Functions for security)
3. **Netlify Account** (for deployment) - The element uses Netlify Functions as a backend proxy to securely call the Statsig API

## Configuration

### Environment Variables

Set the following environment variable in your Netlify deployment:

| Variable | Description |
|----------|-------------|
| `STATSIG_CONSOLE_KEY` | Your Statsig Console API Key (required) |

For local development, create a `.env` file in the project root:

```
STATSIG_CONSOLE_KEY=console-xxxxxxxxxxxxx
```

## Getting Started

### Installation

```bash
pnpm i
```

### Local Development

```bash
pnpm dev
```

This starts Netlify Dev which runs both the Vite development server and the Netlify Functions locally.

## Deployment

1. Deploy to Netlify (connect your repository or use `netlify deploy`)
1. Set the `STATSIG_CONSOLE_KEY` environment variable in Netlify site settings
1. Use the deployed URL as the custom element's hosted code URL in Kontent.ai

## License

Distributed under the MIT License. See [`LICENSE.md`](./LICENSE.md) for more information.
