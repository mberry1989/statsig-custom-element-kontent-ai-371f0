import type { FC } from "react";
import { SpinnerIcon } from "../../icons/SpinnerIcon.tsx";
import styles from "../ConcludeExperimentModal.module.css";

export const CleanupProgressStep: FC = () => (
  <>
    <div className={styles.header}>
      <SpinnerIcon className={styles.spinnerIcon} />
      <h3 className={styles.title}>Concluding Experiment...</h3>
    </div>
    <div className={styles.content}>
      <div className={styles.progressSteps}>
        <div className={styles.progressStep}>
          <SpinnerIcon className={styles.progressSpinner} />
          <span>Processing cleanup...</span>
        </div>
      </div>
    </div>
  </>
);
