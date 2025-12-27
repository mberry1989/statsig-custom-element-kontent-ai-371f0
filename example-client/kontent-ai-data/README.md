# Kontent.ai Data

This folder contains Kontent.ai content type definitions and sample content items used by the sync scripts.

## Contents

### Content Types

- `contentTypes.json` - All content type definitions (text_block, statsig_experiment, landing_page, article_page)
- `contentTypeSnippets.json` - Content type snippets (empty)
- `taxonomyGroups.json` - Taxonomy groups (empty)

### Content Items

- `contentItems.json` - All sample content items in migration-toolkit format

## Usage

See the [main README](../README.md) for complete setup instructions.

### Quick Sync

```bash
# Sync everything (content types + content items)
pnpm sync:all

# Or sync separately
pnpm sync:types
pnpm sync:content
```

## How It Works

- **Content Types**: Uses [@kontent-ai/data-ops](https://github.com/kontent-ai/data-ops) `syncRun()` with a predicate filter. Only syncs the 4 defined types - existing types in your project are not affected.

- **Content Items**: Uses [@kontent-ai/migration-toolkit](https://github.com/kontent-ai/migration-toolkit) `importAsync()`. Creates new items or updates existing items by codename.

## Customization

### Statsig Experiment Content Type

Edit `contentTypes.json` and find the `statsig_experiment` entry to:
- Change the custom element URL (`source_url`) to your deployed URL
- Restrict which content types can be linked in control/test elements
- Modify element guidelines

### Sample Content

After sync, update the sample experiment in Kontent.ai:
- Set the correct Statsig experiment ID using the custom element
- Link your own content items for control/test variants
