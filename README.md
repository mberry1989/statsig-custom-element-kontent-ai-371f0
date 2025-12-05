# Statsig A/B Testing Custom Element for Kontent.ai

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/JiriLojda/statsig-custom-element-kontent-ai)

A [Custom Element](https://kontent.ai/learn/docs/custom-elements) for Kontent.ai that integrates with [Statsig](https://statsig.com/) to enable A/B testing directly from the content management UI.

## Features

- Create Statsig experiments directly from Kontent.ai content items
- View experiment details (status, groups, hypothesis) within the custom element
- Link content items to experiments for A/B testing
- Quick access to the Statsig console for detailed experiment management

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

### Kontent.ai Custom Element Configuration

When adding the custom element to a content type in Kontent.ai:

1. **Hosted code URL**: Point to your deployed Netlify site URL (or local dev URL for testing)
2. **Parameters**: No additional configuration parameters are required

## Getting Started

### Installation

```bash
pnpm install
```

### Local Development

```bash
pnpm run dev
```

This starts Netlify Dev which runs both the Vite development server and the Netlify Functions locally.

### Build

```bash
pnpm run build
```

The production build output is in the `dist` folder.

## Architecture

### Frontend (Custom Element)

- Built with React and Vite
- Stores the Statsig experiment ID as the element value (JSON format: `{ "experimentId": "..." }`)
- Displays experiment details fetched from Statsig API

### Backend (Netlify Functions)

The custom element uses Netlify Functions to proxy requests to the Statsig Console API:

- `/.netlify/functions/get-experiment` - Fetches experiment details by name
- `/.netlify/functions/create-experiment` - Creates a new experiment with default control/test groups (50/50 split)

This architecture keeps your Statsig Console API Key secure on the server side.

## How It Works

1. **Creating an experiment**: Fill in the experiment name and optional hypothesis. The experiment is created in Statsig with two groups: control (50%) and test (50%)
1. **Experiment linked**: The element displays the experiment status, groups, and provides a link to open it in the Statsig console
1. **Unlink**: Remove the experiment association from the content item (does not delete the experiment in Statsig)

## Deployment

1. Deploy to Netlify (connect your repository or use `netlify deploy`)
1. Set the `STATSIG_CONSOLE_KEY` environment variable in Netlify site settings
1. Use the deployed URL as the custom element's hosted code URL in Kontent.ai

## License

Distributed under the MIT License. See [`LICENSE.md`](./LICENSE.md) for more information.
