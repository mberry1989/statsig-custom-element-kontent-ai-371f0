# Data-Ops Backup

This folder contains Kontent.ai content that can be imported into your project using the [Kontent.ai Data-Ops CLI](https://github.com/kontent-ai/data-ops).

## Contents

- `content-types/statsig_experiment.json` - The Statsig Experiment content type definition
- `content-items/sample_experiment.json` - A sample experiment item

## Usage

See the [main README](../README.md#setting-up-kontent-ai-content) for import instructions.

## Customization

### Content Type

Edit `content-types/statsig_experiment.json` to:
- Change the content type codename
- Restrict which content types can be linked in control/test elements
- Modify the custom element URL

### Sample Content

The sample experiment uses placeholder values:
- `experimentId`: `sample_homepage_experiment` - Update to match your Statsig experiment
- `control`/`test`: Empty arrays - Add references to your actual content items
