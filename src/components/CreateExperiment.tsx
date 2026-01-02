import { useMutation, useQuery } from "@tanstack/react-query";
import { type FC, useCallback, useState } from "react";
import { createExperiment, listExperiments } from "../api/statsig.ts";
import { LightbulbIcon } from "../icons/LightbulbIcon.tsx";
import { SpinnerIcon } from "../icons/SpinnerIcon.tsx";
import styles from "./CreateExperiment.module.css";
import { SelectExperimentModal } from "./SelectExperimentModal.tsx";

type ItemInfo = {
  readonly id: string;
  readonly codename: string;
  readonly name: string;
};

type CreateExperimentProps = {
  readonly itemInfo: ItemInfo;
  readonly onCreated: (experimentId: string) => void;
  readonly isDisabled: boolean;
};

export const CreateExperiment: FC<CreateExperimentProps> = ({
  itemInfo,
  onCreated,
  isDisabled,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [experimentName, setExperimentName] = useState(itemInfo.codename);
  const [hypothesis, setHypothesis] = useState("");

  const { data: experiments, isLoading: isLoadingExperiments } = useQuery({
    queryKey: ["experiments"],
    queryFn: listExperiments,
  });

  const openForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const openSelectModal = useCallback(() => {
    setIsSelectModalOpen(true);
  }, []);

  const closeSelectModal = useCallback(() => {
    setIsSelectModalOpen(false);
  }, []);

  const handleSelectExperiment = useCallback(
    (experimentId: string) => {
      onCreated(experimentId);
      closeSelectModal();
    },
    [onCreated, closeSelectModal],
  );

  const mutation = useMutation({
    mutationFn: createExperiment,
    onSuccess: (experiment) => {
      onCreated(experiment.id);
      closeForm();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experimentName.trim()) {
      return;
    }

    mutation.mutate({
      name: experimentName.trim(),
      hypothesis: hypothesis.trim() || undefined,
    });
  };

  const hasExperiments = experiments && experiments.length > 0;
  const isSelectDisabled = isLoadingExperiments || !hasExperiments;

  if (!isFormOpen) {
    return (
      <div className={styles.emptyStateWrapper}>
        <div className={styles.emptyState}>
          <LightbulbIcon className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No experiment linked</h3>
          <p className={styles.emptyDescription}>
            Create a new experiment or select an existing one from Statsig.
          </p>
          {!isDisabled && (
            <div className={styles.buttonGroup}>
              <button type="button" onClick={openForm} className={styles.primaryButton}>
                Create New
              </button>
              <button
                type="button"
                onClick={openSelectModal}
                className={styles.secondaryButton}
                disabled={isSelectDisabled}
                title={
                  isSelectDisabled
                    ? isLoadingExperiments
                      ? "Loading experiments..."
                      : "No experiments available"
                    : undefined
                }
              >
                {isLoadingExperiments ? "Loading..." : "Select Existing"}
              </button>
            </div>
          )}
        </div>
        {isSelectModalOpen && experiments ? (
          <SelectExperimentModal
            experiments={experiments}
            onSelect={handleSelectExperiment}
            onClose={closeSelectModal}
          />
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.formTitle}>Create Statsig Experiment</h3>

      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="experimentName" className={styles.label}>
            Experiment Name *
          </label>
          <input
            type="text"
            id="experimentName"
            value={experimentName}
            onChange={(e) => setExperimentName(e.target.value)}
            className={styles.input}
            placeholder="e.g., hero_cta_experiment"
            required
          />
          <p className={styles.hint}>Use lowercase letters, numbers, and underscores</p>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="hypothesis" className={styles.label}>
            Hypothesis (optional)
          </label>
          <textarea
            id="hypothesis"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            rows={2}
            className={styles.textarea}
            placeholder="What do you expect to happen?"
          />
        </div>

        <div className={styles.infoBox}>
          <p>
            <strong>Groups:</strong> control (50%) and test (50%)
          </p>
        </div>
      </div>

      {mutation.error ? (
        <div className={styles.errorMessage}>
          {mutation.error instanceof Error ? mutation.error.message : "Failed to create experiment"}
        </div>
      ) : null}

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={closeForm}
          className={styles.secondaryButton}
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={mutation.isPending || !experimentName.trim()}
        >
          {mutation.isPending ? (
            <>
              <SpinnerIcon
                className={styles.spinner}
                trackClassName={styles.spinnerTrack}
                headClassName={styles.spinnerHead}
              />
              Creating...
            </>
          ) : (
            "Create Experiment"
          )}
        </button>
      </div>
    </form>
  );
};
