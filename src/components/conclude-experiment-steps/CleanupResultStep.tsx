import type { FC } from "react";
import { CheckIcon } from "../../icons/CheckIcon.tsx";
import { CloseIcon } from "../../icons/CloseIcon.tsx";
import { ErrorIcon } from "../../icons/ErrorIcon.tsx";
import type { CleanupResult } from "../../types/index.ts";
import styles from "../ConcludeExperimentModal.module.css";

type CleanupResultStepProps = {
  readonly result: CleanupResult | null;
  readonly error: Error | null;
  readonly onClose: () => void;
};

const isSuccess = (result: CleanupResult | null): boolean => result?.errors.length === 0;

export const CleanupResultStep: FC<CleanupResultStepProps> = ({ result, error, onClose }) => (
  <>
    <div className={styles.header}>
      {isSuccess(result) ? (
        <CheckIcon className={styles.successIcon} />
      ) : (
        <ErrorIcon className={styles.errorIcon} />
      )}
      <h3 className={styles.title}>
        {isSuccess(result) ? "Experiment Concluded" : "Cleanup Failed"}
      </h3>
      <button type="button" onClick={onClose} className={styles.closeButton}>
        <CloseIcon />
      </button>
    </div>
    <div className={styles.content}>
      {result ? (
        <div className={styles.resultDetails}>
          <div className={styles.resultItem}>
            <span className={result.statsigConcluded ? styles.resultSuccess : styles.resultFailed}>
              {result.statsigConcluded ? "✓" : "✗"}
            </span>
            <span>Statsig experiment concluded</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultInfo}>•</span>
            <span>
              {result.usagesFound === false
                ? "Failed to find usages"
                : `Found ${result.usagesFound.length} usage(s)`}
            </span>
          </div>
          <div className={styles.resultItem}>
            <span
              className={
                result.usagesFound !== false &&
                result.usagesReplaced.length === result.usagesFound.length
                  ? styles.resultSuccess
                  : styles.resultFailed
              }
            >
              {result.usagesFound !== false &&
              result.usagesReplaced.length === result.usagesFound.length
                ? "✓"
                : "!"}
            </span>
            <span>
              {result.usagesFound === false
                ? "Could not replace references"
                : `Replaced ${result.usagesReplaced.length}/${result.usagesFound.length} reference(s)`}
            </span>
          </div>
          <div className={styles.resultItem}>
            <span className={result.experimentDeleted ? styles.resultSuccess : styles.resultFailed}>
              {result.experimentDeleted ? "✓" : "✗"}
            </span>
            <span>Experiment item deleted</span>
          </div>
          {result.errors.length > 0 && (
            <div className={styles.errorList}>
              <p className={styles.errorListTitle}>Errors:</p>
              {result.errors.map((err) => (
                <div key={err.step} className={styles.errorItem}>
                  <strong>{err.step}:</strong> {err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>{error.message}</div>
      ) : null}
    </div>
    <div className={styles.footer}>
      <button type="button" onClick={onClose} className={styles.primaryButton}>
        Close
      </button>
    </div>
  </>
);
