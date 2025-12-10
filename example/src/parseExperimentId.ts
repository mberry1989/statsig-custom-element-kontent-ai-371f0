type StatsigCustomElementValue = {
  readonly experimentId: string;
};

export const parseExperimentId = (value: string): string => {
  const parsed: StatsigCustomElementValue = JSON.parse(value);

  if (!parsed.experimentId) {
    throw new Error('Missing experimentId in custom element value');
  }

  return parsed.experimentId;
};
