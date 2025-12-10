import { useCallback, useMemo } from 'react';
import { useStatsigClient } from '@statsig/react-bindings';
import { transformToPortableText } from '@kontent-ai/rich-text-resolver';
import { PortableText } from '@kontent-ai/rich-text-resolver/utils/react';
import { createExperimentAwareResolvers } from './experimentResolver';
import { mockRichTextValue, mockLinkedItems, type ExperimentVariant } from './mockData';
import { getUserId } from './userId';

export const App = () => {
  const { client } = useStatsigClient();

  const getWinningVariant = useCallback(
    (experimentId: string): ExperimentVariant => {
      const experiment = client.getExperiment(experimentId);
      return experiment.get('variant', 'control') as ExperimentVariant;
    },
    [client],
  );

  const resolvers = useMemo(
    () => createExperimentAwareResolvers(mockLinkedItems, getWinningVariant),
    [getWinningVariant],
  );

  const portableText = useMemo(
    () => transformToPortableText(mockRichTextValue),
    [],
  );

  return (
    <div>
      <h1>Statsig Experiment Resolution Example</h1>
      <p>
        <strong>User ID:</strong> <code>{getUserId()}</code>
      </p>
      <hr />
      <PortableText value={portableText} components={resolvers} />
    </div>
  );
};
