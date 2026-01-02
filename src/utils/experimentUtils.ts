import type { StatsigExperiment } from "../types/index.ts";

export const hasMatchingVariants = (experiment: StatsigExperiment): boolean => {
  const groups = experiment.groups ?? [];
  const hasControl = groups.some(
    (g) => g.name === "control" && g.parameterValues.variant === "control",
  );
  const hasTest = groups.some((g) => g.name === "test" && g.parameterValues.variant === "test");
  return hasControl && hasTest;
};
