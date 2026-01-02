import type { IContentItem } from "@kontent-ai/delivery-sdk";
import type { PortableTextReactResolvers } from "@kontent-ai/rich-text-resolver/utils/react";
import { Fragment, type JSX } from "react";
import {
  type ExperimentVariant,
  parseExperimentId,
  type StatsigExperiment,
  type TextBlock,
} from "./types.ts";

type GetWinningVariant = (experimentId: string) => ExperimentVariant;

type ContentItem = IContentItem;

const renderTextBlock = (item: TextBlock): JSX.Element => {
  return <p>{item.elements.text.value}</p>;
};

export const renderContentItem = (
  item: ContentItem,
  getWinningVariant: GetWinningVariant,
): JSX.Element | null => {
  switch (item.system.type) {
    case "text_block":
      return renderTextBlock(item as TextBlock);
    case "statsig_experiment":
      return renderExperiment(item as StatsigExperiment, getWinningVariant);
    default:
      return <div>Unknown content type: {item.system.type}</div>;
  }
};

const renderExperiment = (
  item: StatsigExperiment,
  getWinningVariant: GetWinningVariant,
): JSX.Element => {
  const experimentId = parseExperimentId(item.elements.statsig_a_b_testing.value);

  if (!experimentId) {
    return <div>Error: Missing experiment ID in content item: {item.system.codename}</div>;
  }

  const variant = getWinningVariant(experimentId);
  const winningItems = item.elements[variant].linkedItems;

  return (
    <div className="experiment-content">
      <span className={`variant-badge variant-${variant}`}>{variant.toUpperCase()}</span>
      {winningItems.map((contentItem) => (
        <Fragment key={contentItem.system.id}>
          {renderContentItem(contentItem, getWinningVariant)}
        </Fragment>
      ))}
    </div>
  );
};

export const createExperimentAwareResolvers = (
  linkedItems: ReadonlyArray<ContentItem>,
  getWinningVariant: GetWinningVariant,
): PortableTextReactResolvers => ({
  types: {
    componentOrItem: ({ value }) => {
      const item = linkedItems.find((i) => i.system.id === value.componentOrItem._ref);

      if (!item) {
        return <div>Content item not found: {value.componentOrItem._ref}</div>;
      }

      return renderContentItem(item, getWinningVariant);
    },
  },
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
});
