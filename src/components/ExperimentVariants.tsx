import {
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { type FC, useState } from "react";
import type { StatsigExperimentGroup } from "../types/index.ts";
import styles from "./ExperimentVariants.module.css";

type ExperimentVariantsProps = {
  readonly groups: ReadonlyArray<StatsigExperimentGroup> | undefined;
};

const INVALID_VARIANT_MESSAGE =
  "This variant is not configured correctly for this element. Expected a parameter named 'variant' with value 'control' or 'test'.";

const isValidVariant = (group: StatsigExperimentGroup): boolean =>
  group.parameterValues.variant === "control" || group.parameterValues.variant === "test";

type VariantTagProps = {
  readonly group: StatsigExperimentGroup;
  readonly isValid: boolean;
};

const VariantTag: FC<VariantTagProps> = ({ group, isValid }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const tagClassName = isValid ? styles.groupTag : `${styles.groupTag} ${styles.groupTagInvalid}`;

  return (
    <>
      <span ref={refs.setReference} className={tagClassName} {...getReferenceProps()}>
        {group.name} ({group.size}%)
      </span>
      {!isValid && isOpen ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={styles.tooltip}
            {...getFloatingProps()}
          >
            {INVALID_VARIANT_MESSAGE}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
};

export const ExperimentVariants: FC<ExperimentVariantsProps> = ({ groups }) => {
  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.groupsList}>
        {groups.map((group) => (
          <VariantTag key={group.name} group={group} isValid={isValidVariant(group)} />
        ))}
      </div>
    </div>
  );
};
