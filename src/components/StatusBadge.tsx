import type { FC } from "react";
import type { StatsigExperimentStatus } from "../types/index.ts";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  readonly status: StatsigExperimentStatus;
};

const statusLabels: Record<StatsigExperimentStatus, string> = {
  setup: "Setup",
  active: "Active",
  decision_made: "Decision Made",
  abandoned: "Abandoned",
};

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => (
  <span className={`${styles.badge} ${styles[status]}`}>{statusLabels[status]}</span>
);
