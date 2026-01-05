export type StatsigExperimentStatus = "setup" | "active" | "decision_made" | "abandoned";

export type StatsigExperimentGroup = {
  readonly name: string;
  readonly size: number;
  readonly parameterValues: Record<string, unknown>;
};

export type StatsigExperiment = {
  readonly id: string;
  readonly name: string;
  readonly status: StatsigExperimentStatus;
  readonly hypothesis?: string;
  readonly description?: string;
  readonly groups?: ReadonlyArray<StatsigExperimentGroup>;
  readonly createdTime?: number;
  readonly startTime?: number;
  readonly endTime?: number;
};

export type { CleanupError, CleanupResult } from "../../netlify/functions/cleanup-experiment.ts";

export type ExperimentScenario =
  | { readonly type: "linked_item"; readonly experimentItemId: string }
  | { readonly type: "component"; readonly parentItemId: string };

export type ComponentSearchResult = {
  readonly elementId: string;
  readonly componentId: string;
  readonly winningVariantItemIds: ReadonlyArray<string>;
};

export type CapabilityStatus = {
  readonly enabled: boolean;
};

export type Capabilities = {
  readonly cleanup: CapabilityStatus;
};
