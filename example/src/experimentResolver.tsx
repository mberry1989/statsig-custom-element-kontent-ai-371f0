import { Fragment, type JSX } from 'react';
import type { PortableTextReactResolvers } from '@kontent-ai/rich-text-resolver/utils/react';
import { parseExperimentId } from './parseExperimentId';
import type { ContentItem, ExperimentVariant } from './mockData';

type GetWinningVariant = (experimentId: string) => ExperimentVariant;

type ExperimentElements = {
  readonly statsig_a_b_testing: { readonly value: string };
  readonly control: { readonly linkedItems: ReadonlyArray<ContentItem> };
  readonly test: { readonly linkedItems: ReadonlyArray<ContentItem> };
};

type TextBlockElements = {
  readonly text: { readonly value: string };
};

const renderTextBlock = (item: ContentItem): JSX.Element => {
  const elements = item.elements as TextBlockElements;
  return <p>{elements.text.value}</p>;
};

const renderContentItem = (item: ContentItem, getWinningVariant: GetWinningVariant): JSX.Element | null => {
  switch (item.system.type) {
    case 'text_block':
      return renderTextBlock(item);
    case 'experiment':
      return renderExperiment(item, getWinningVariant);
    default:
      return <div>Unknown content type: {item.system.type}</div>;
  }
};

const renderExperiment = (
  item: ContentItem,
  getWinningVariant: GetWinningVariant,
): JSX.Element => {
  const elements = item.elements as ExperimentElements;
  const experimentId = parseExperimentId(elements.statsig_a_b_testing.value);
  const variant = getWinningVariant(experimentId);

  const winningItems =
    variant === 'control' ? elements.control.linkedItems : elements.test.linkedItems;

  return (
    <div className="experiment-content">
      <span className={`variant-badge variant-${variant}`}>{variant.toUpperCase()}</span>
      {winningItems.map((contentItem) => (
        <Fragment key={contentItem.system.id}>{renderContentItem(contentItem, getWinningVariant)}</Fragment>
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
      const item = linkedItems.find(
        (i) => i.system.id === value.componentOrItem._ref,
      );

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
