import { useMutation } from "@tanstack/react-query";
import { type FC, type ReactNode, useCallback, useState } from "react";
import { cleanupExperiment } from "../api/statsig.ts";
import type { CleanupResult, StatsigExperiment } from "../types/index.ts";
import styles from "./ConcludeExperimentModal.module.css";
import { CleanupProgressStep } from "./conclude-experiment-steps/CleanupProgressStep.tsx";
import { CleanupResultStep } from "./conclude-experiment-steps/CleanupResultStep.tsx";
import { ConfirmCleanupStep } from "./conclude-experiment-steps/ConfirmCleanupStep.tsx";
import { SelectVariantStep } from "./conclude-experiment-steps/SelectVariantStep.tsx";

type ConcludeExperimentModalProps = {
  readonly experiment: StatsigExperiment;
  readonly experimentItemId: string;
  readonly experimentItemCodename: string;
  readonly environmentId: string;
  readonly onClose: () => void;
  readonly onCompleted: () => void;
};

type WinningVariant = "control" | "test";

type Step = "select" | "confirm" | "progress" | "result";

const getGroupId = (experiment: StatsigExperiment, variantName: WinningVariant): string | null => {
  const group = experiment.groups?.find((g) => g.name === variantName);
  return group ? ((group as unknown as { id?: string }).id ?? variantName) : variantName;
};

export const ConcludeExperimentModal: FC<ConcludeExperimentModalProps> = ({
  experiment,
  experimentItemId,
  experimentItemCodename,
  environmentId,
  onClose,
  onCompleted,
}) => {
  const [step, setStep] = useState<Step>("select");
  const [selectedVariant, setSelectedVariant] = useState<WinningVariant>("control");
  const [decisionReason, setDecisionReason] = useState("");
  const [result, setResult] = useState<CleanupResult | null>(null);

  const { mutate, error } = useMutation({
    mutationFn: cleanupExperiment,
    onSuccess: (data) => {
      setResult(data);
      setStep("result");
      if (data.errors.length === 0) {
        onCompleted();
      }
    },
    onError: () => {
      setStep("result");
    },
  });

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleConfirm = useCallback(() => {
    setStep("confirm");
  }, []);

  const handleStartCleanup = useCallback(() => {
    setStep("progress");
    mutate({
      experimentId: experiment.id,
      experimentItemId,
      experimentItemCodename,
      environmentId,
      winningVariant: selectedVariant,
      variantGroupId: getGroupId(experiment, selectedVariant) ?? selectedVariant,
      decisionReason,
    });
  }, [
    experiment,
    experimentItemId,
    experimentItemCodename,
    environmentId,
    selectedVariant,
    decisionReason,
    mutate,
  ]);

  const handleBack = useCallback(() => {
    setStep("select");
  }, []);

  const canDismiss = step !== "progress";

  const renderStep = (): ReactNode => {
    switch (step) {
      case "select":
        return (
          <SelectVariantStep
            experimentName={experiment.name}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            onCancel={onClose}
            onContinue={handleConfirm}
          />
        );
      case "confirm":
        return (
          <ConfirmCleanupStep
            selectedVariant={selectedVariant}
            decisionReason={decisionReason}
            onDecisionReasonChange={setDecisionReason}
            onBack={handleBack}
            onConfirm={handleStartCleanup}
            onClose={onClose}
          />
        );
      case "progress":
        return <CleanupProgressStep />;
      case "result":
        return (
          <CleanupResultStep
            result={result}
            error={error instanceof Error ? error : null}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={canDismiss ? handleOverlayClick : undefined}
      onKeyDown={canDismiss ? (e) => e.key === "Escape" && onClose() : undefined}
      role="presentation"
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {renderStep()}
      </div>
    </div>
  );
};
