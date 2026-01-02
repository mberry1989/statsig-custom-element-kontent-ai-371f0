import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { PortableText } from "@kontent-ai/rich-text-resolver/utils/react";
import { useStatsigClient } from "@statsig/react-bindings";
import { type FC, useCallback, useMemo } from "react";
import { createExperimentAwareResolvers } from "./experimentResolver.tsx";
import type { ArticlePage, ExperimentVariant, StatsigExperiment } from "./types.ts";

type RichTextExampleProps = {
  readonly articlePage: ArticlePage;
};

export const RichTextExample: FC<RichTextExampleProps> = ({ articlePage }) => {
  const { client } = useStatsigClient();

  const getWinningVariant = useCallback(
    (experimentId: string): ExperimentVariant => {
      const experiment = client.getExperiment(experimentId);
      return experiment.get("variant", "control") as ExperimentVariant;
    },
    [client],
  );

  // Rich text linked items are loosely typed - cast through unknown for specific types
  const linkedItems = articlePage.elements.body
    .linkedItems as unknown as ReadonlyArray<StatsigExperiment>;

  const resolvers = useMemo(
    () => createExperimentAwareResolvers(linkedItems, getWinningVariant),
    [linkedItems, getWinningVariant],
  );

  const portableText = useMemo(
    () => transformToPortableText(articlePage.elements.body.value),
    [articlePage.elements.body.value],
  );

  return (
    <div>
      <h2>Rich Text Component Example</h2>
      <p>
        <strong>Article:</strong> {articlePage.elements.title.value}
      </p>
      <hr />
      <PortableText value={portableText} components={resolvers} />

      <hr />
      <details>
        <summary>How this works</summary>
        <ol style={{ lineHeight: 1.8 }}>
          <li>
            Rich text contains an experiment as a component:{" "}
            <code>&lt;object data-type="component" data-id="..."&gt;</code>
          </li>
          <li>
            We transform the rich text to portable text using <code>transformToPortableText()</code>
          </li>
          <li>
            Custom resolvers from <code>createExperimentAwareResolvers()</code> handle experiment
            components
          </li>
          <li>
            The resolver looks up the winning variant from Statsig and renders the correct content
          </li>
        </ol>
      </details>
    </div>
  );
};
