import type { FC } from "react";
import { CloseIcon } from "../../icons/CloseIcon.tsx";
import { TrophyIcon } from "../../icons/TrophyIcon.tsx";
import styles from "../ConcludeExperimentModal.module.css";

type WinningVariant = "control" | "test";

type SelectVariantStepProps = {
  readonly experimentName: string;
  readonly selectedVariant: WinningVariant;
  readonly onVariantChange: (variant: WinningVariant) => void;
  readonly onCancel: () => void;
  readonly onContinue: () => void;
};

export const SelectVariantStep: FC<SelectVariantStepProps> = ({
  experimentName,
  selectedVariant,
  onVariantChange,
  onCancel,
  onContinue,
}) => (
  <>
    <div className={styles.header}>
      <TrophyIcon className={styles.headerIcon} />
      <h3 className={styles.title}>Conclude Experiment</h3>
      <button type="button" onClick={onCancel} className={styles.closeButton}>
        <CloseIcon />
      </button>
    </div>
    <div className={styles.content}>
      <p className={styles.description}>
        Select the winning variant for "<strong>{experimentName}</strong>":
      </p>
      <div className={styles.variantOptions}>
        <label className={styles.variantOption}>
          <input
            type="radio"
            name="variant"
            value="control"
            checked={selectedVariant === "control"}
            onChange={() => onVariantChange("control")}
            className={styles.radio}
          />
          <span className={styles.variantLabel}>Control</span>
          <span className={styles.variantDescription}>Original version</span>
        </label>
        <label className={styles.variantOption}>
          <input
            type="radio"
            name="variant"
            value="test"
            checked={selectedVariant === "test"}
            onChange={() => onVariantChange("test")}
            className={styles.radio}
          />
          <span className={styles.variantLabel}>Test</span>
          <span className={styles.variantDescription}>Experimental version</span>
        </label>
      </div>
    </div>
    <div className={styles.footer}>
      <button type="button" onClick={onCancel} className={styles.secondaryButton}>
        Cancel
      </button>
      <button type="button" onClick={onContinue} className={styles.primaryButton}>
        Continue
      </button>
    </div>
  </>
);
