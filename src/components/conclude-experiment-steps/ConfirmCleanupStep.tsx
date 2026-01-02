import type { FC } from "react";
import { CloseIcon } from "../../icons/CloseIcon.tsx";
import { TrophyIcon } from "../../icons/TrophyIcon.tsx";
import styles from "../ConcludeExperimentModal.module.css";

type WinningVariant = "control" | "test";

type ConfirmCleanupStepProps = {
  readonly selectedVariant: WinningVariant;
  readonly decisionReason: string;
  readonly onDecisionReasonChange: (reason: string) => void;
  readonly onBack: () => void;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
};

export const ConfirmCleanupStep: FC<ConfirmCleanupStepProps> = ({
  selectedVariant,
  decisionReason,
  onDecisionReasonChange,
  onBack,
  onConfirm,
  onClose,
}) => {
  const canConfirm = decisionReason.trim().length > 0;

  return (
    <>
      <div className={styles.header}>
        <TrophyIcon className={styles.headerIcon} />
        <h3 className={styles.title}>Confirm Cleanup</h3>
        <button type="button" onClick={onClose} className={styles.closeButton}>
          <CloseIcon />
        </button>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>
          You are about to conclude the experiment with <strong>{selectedVariant}</strong> as the
          winner.
        </p>
        <div className={styles.formGroup}>
          <label htmlFor="decisionReason" className={styles.label}>
            Why are you concluding this experiment?
          </label>
          <textarea
            id="decisionReason"
            className={styles.textarea}
            placeholder="e.g., Test variant showed 15% improvement in conversion rate..."
            value={decisionReason}
            onChange={(e) => onDecisionReasonChange(e.target.value)}
          />
        </div>
        <div className={styles.actionList}>
          <p className={styles.actionListTitle}>This will:</p>
          <ul className={styles.actions}>
            <li>Mark "{selectedVariant}" as the winner in Statsig</li>
            <li>Find all content items using this experiment</li>
            <li>Replace experiment references with winning variant content</li>
            <li>Delete this experiment item</li>
          </ul>
        </div>
        <div className={styles.warning}>This action cannot be undone.</div>
      </div>
      <div className={styles.footer}>
        <button type="button" onClick={onBack} className={styles.secondaryButton}>
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={styles.dangerButton}
          disabled={!canConfirm}
        >
          Conclude Experiment
        </button>
      </div>
    </>
  );
};
