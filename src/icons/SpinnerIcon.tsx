import type { FC, SVGProps } from "react";

type SpinnerIconProps = SVGProps<SVGSVGElement> & {
  readonly trackClassName?: string;
  readonly headClassName?: string;
};

export const SpinnerIcon: FC<SpinnerIconProps> = ({ trackClassName, headClassName, ...props }) => (
  <svg fill="none" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <circle
      className={trackClassName}
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className={headClassName}
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
