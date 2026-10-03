import type { SVGProps } from "react";

const paths = {
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  "arrow-left": "M19 12H5m6-6-6 6 6 6",
  download: "M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M18 6 6 18",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42",
  moon: "M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  copy: "M9 9h11v11H9zM15 9V4H4v11h5",
  lock: "M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3m-4 4v3",
  external: "M14 4h6v6m0-6-9 9M10 4H4v16h16v-6",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
  ...props
}: Omit<SVGProps<SVGSVGElement>, "name"> & { name: IconName }) {
  return (
    <svg
      {...props}
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
