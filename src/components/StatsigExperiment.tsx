import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getExperiment } from "../api/statsig.ts";
import {
  useEnvironmentId,
  useIsDisabled,
  useItemInfo,
  useValue,
} from "../customElement/CustomElementContext.tsx";
import { ErrorIcon } from "../icons/ErrorIcon.tsx";
import { SpinnerIcon } from "../icons/SpinnerIcon.tsx";
import { ConcludeExperimentModal } from "./ConcludeExperimentModal.tsx";
import { CreateExperiment } from "./CreateExperiment.tsx";
import { ExperimentDetails } from "./ExperimentDetails.tsx";
import styles from "./StatsigExperiment.module.css";

export const StatsigExperiment = () => {
  const [value, setValue] = useValue();
  const itemInfo = useItemInfo();
  const isDisabled = useIsDisabled();
  const environmentId = useEnvironmentId();
  const [showConcludeModal, setShowConcludeModal] = useState(false);

  const experimentId = value?.experimentId ?? null;

  const {
    data: experiment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["experiment", experimentId],
    queryFn: async () => {
      if (!experimentId) {
        throw new Error("experimentId is required");
      }
      return await getExperiment(experimentId);
    },
    enabled: Boolean(experimentId),
  });

  const handleCreated = (newExperimentId: string) => {
    setValue({ experimentId: newExperimentId });
  };

  const handleUnlink = () => {
    setValue(null);
  };

  const handleConclude = useCallback(() => {
    setShowConcludeModal(true);
  }, []);

  const handleCloseConcludeModal = useCallback(() => {
    setShowConcludeModal(false);
  }, []);

  const handleConcludeCompleted = useCallback(() => {
    // After successful cleanup, unlink the experiment (item was deleted)
    setValue(null);
    setShowConcludeModal(false);
  }, [setValue]);

  if (!experimentId) {
    return (
      <CreateExperiment itemInfo={itemInfo} onCreated={handleCreated} isDisabled={isDisabled} />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <SpinnerIcon
          className={styles.spinner}
          trackClassName={styles.spinnerTrack}
          headClassName={styles.spinnerHead}
        />
        <span className={styles.loadingText}>Loading experiment...</span>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <ErrorIcon className={styles.errorIcon} />
          <div className={styles.errorBody}>
            <h3 className={styles.errorTitle}>Experiment not found</h3>
            <p className={styles.errorMessage}>
              The experiment "<code className={styles.errorCode}>{experimentId}</code>" was not
              found in Statsig. It may have been deleted.
            </p>
            <div className={styles.errorActions}>
              <button type="button" onClick={() => void refetch()} className={styles.errorLink}>
                Retry
              </button>
              {!isDisabled && (
                <button type="button" onClick={handleUnlink} className={styles.errorLink}>
                  Unlink experiment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ExperimentDetails
        experiment={experiment}
        onUnlink={handleUnlink}
        onConclude={handleConclude}
        isDisabled={isDisabled}
      />
      {showConcludeModal ? (
        <ConcludeExperimentModal
          experiment={experiment}
          experimentItemId={itemInfo.id}
          experimentItemCodename={itemInfo.codename}
          environmentId={environmentId}
          onClose={handleCloseConcludeModal}
          onCompleted={handleConcludeCompleted}
        />
      ) : null}
    </>
  );
};
