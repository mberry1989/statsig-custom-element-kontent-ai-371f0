import { type FC, useCallback, useState } from "react";
import { CloseIcon } from "../icons/CloseIcon.tsx";
import { WarningIcon } from "../icons/WarningIcon.tsx";
import type { StatsigExperiment } from "../types/index.ts";
import { hasMatchingVariants } from "../utils/experimentUtils.ts";
import { ExperimentVariants } from "./ExperimentVariants.tsx";
import styles from "./SelectExperimentModal.module.css";
import { StatusBadge } from "./StatusBadge.tsx";

type SelectExperimentModalProps = {
  readonly experiments: ReadonlyArray<StatsigExperiment>;
  readonly onSelect: (experimentId: string) => void;
  readonly onClose: () => void;
};

export const SelectExperimentModal: FC<SelectExperimentModalProps> = ({
  experiments,
  onSelect,
  onClose,
}) => {
  const [selectedExperiment, setSelectedExperiment] = useState<StatsigExperiment | null>(null);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);

  const handleExperimentClick = useCallback(
    (experiment: StatsigExperiment) => {
      setSelectedExperiment(experiment);
      const hasMatching = hasMatchingVariants(experiment);
      if (hasMatching) {
        onSelect(experiment.id);
      } else {
        setShowWarningConfirm(true);
      }
    },
    [onSelect],
  );

  const handleConfirmWithWarning = useCallback(() => {
    if (selectedExperiment) {
      onSelect(selectedExperiment.id);
    }
  }, [selectedExperiment, onSelect]);

  const handleCancelWarning = useCallback(() => {
    setShowWarningConfirm(false);
    setSelectedExperiment(null);
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (showWarningConfirm && selectedExperiment) {
    return (
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        onKeyDown={(e) => e.key === "Escape" && handleCancelWarning()}
        role="presentation"
      >
        <div className={styles.modal} role="dialog" aria-modal="true">
          <div className={styles.warningHeader}>
            <WarningIcon className={styles.warningIcon} />
            <h3 className={styles.warningTitle}>Variant Mismatch Warning</h3>
          </div>
          <p className={styles.warningMessage}>
            The experiment "<strong>{selectedExperiment.name}</strong>" doesn't have the expected
            'control' and 'test' variants with matching parameter values. It may not work correctly
            with this element.
          </p>
          <div className={styles.warningActions}>
            <button type="button" onClick={handleCancelWarning} className={styles.secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmWithWarning}
              className={styles.warningButton}
            >
              Link Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h3 className={styles.title}>Select Existing Experiment</h3>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.experimentList}>
          {experiments.map((experiment) => {
            const hasMatching = hasMatchingVariants(experiment);
            return (
              <button
                key={experiment.id}
                type="button"
                className={styles.experimentItem}
                onClick={() => handleExperimentClick(experiment)}
              >
                <div className={styles.experimentHeader}>
                  <span className={styles.experimentName}>{experiment.name}</span>
                  <StatusBadge status={experiment.status} />
                </div>
                <ExperimentVariants groups={experiment.groups} />
                {!hasMatching && (
                  <div className={styles.mismatchWarning}>
                    <WarningIcon className={styles.mismatchIcon} />
                    <span>Variants don't match expected structure</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
