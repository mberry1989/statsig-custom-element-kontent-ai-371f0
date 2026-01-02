import type { FC, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const TrophyIcon: FC<IconProps> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3h14M5 3v4a7 7 0 0014 0V3M5 3H3v4a4 4 0 004 4M19 3h2v4a4 4 0 01-4 4M12 14v3m0 0l-3 3h6l-3-3z"
    />
  </svg>
);
