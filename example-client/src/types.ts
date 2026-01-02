import type { Elements, IContentItem } from "@kontent-ai/delivery-sdk";

export type ExperimentVariant = "control" | "test";

/**
 * Text block content type - simple content with a text element
 */
export type TextBlock = IContentItem<{
  readonly text: Elements.TextElement;
}>;

/**
 * Statsig Experiment content type
 * - statsig_a_b_testing: Custom element storing { experimentId: string }
 * - control: Linked items for control variant
 * - test: Linked items for test variant
 */
export type StatsigExperiment = IContentItem<{
  readonly statsig_a_b_testing: Elements.CustomElement;
  readonly control: Elements.LinkedItemsElement<TextBlock>;
  readonly test: Elements.LinkedItemsElement<TextBlock>;
}>;

/**
 * Landing page content type - for Linked Items pattern
 * - title: Page title
 * - experiments: Linked experiments
 */
export type LandingPage = IContentItem<{
  readonly title: Elements.TextElement;
  readonly experiments: Elements.LinkedItemsElement<StatsigExperiment>;
}>;

/**
 * Article page content type - for Rich Text pattern
 * - title: Article title
 * - body: Rich text with embedded experiment components
 */
export type ArticlePage = IContentItem<{
  readonly title: Elements.TextElement;
  readonly body: Elements.RichTextElement;
}>;

/**
 * Union type for all content items that can be linked in experiments
 */
export type ExperimentContent = TextBlock;

/**
 * Parse experiment ID from custom element JSON value
 */
export const parseExperimentId = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as { experimentId?: string };
    return parsed.experimentId ?? null;
  } catch {
    return null;
  }
};
