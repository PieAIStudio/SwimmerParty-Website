/**
 * The white model, drawn flat.
 *
 * The 3D stage cannot be spun up once per roster card — twelve canvases is
 * not a trade anyone should make for a thumbnail. This is the same figure
 * as a single inline SVG: identical proportions against a 1.755 m body,
 * the same joint-capped segments, drawn as outlines so it reads as a
 * drawing rather than a render.
 *
 * It fills the space where a plate will eventually go with the thing that
 * is actually true right now — this actor exists as a white model — instead
 * of an empty hatch that says nothing.
 */
export function Mannequin({ className, accent }: { className?: string; accent: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 190"
      fill="none"
      stroke={accent}
      strokeWidth="0.9"
      strokeLinecap="round"
      aria-hidden
    >
      <g opacity="0.5">
        {/* head / neck */}
        <circle cx="50" cy="17" r="11.5" />
        <rect x="45.5" y="27" width="9" height="9" rx="4.5" />

        {/* torso / pelvis */}
        <rect x="34" y="34" width="32" height="50" rx="16" />
        <rect x="37.5" y="80" width="25" height="22" rx="12.5" />

        {/* arms */}
        <circle cx="30" cy="42" r="6" />
        <circle cx="70" cy="42" r="6" />
        <rect x="23.5" y="44" width="10" height="32" rx="5" />
        <rect x="66.5" y="44" width="10" height="32" rx="5" />
        <circle cx="28.5" cy="77" r="5" />
        <circle cx="71.5" cy="77" r="5" />
        <rect x="24" y="79" width="9" height="30" rx="4.5" />
        <rect x="67" y="79" width="9" height="30" rx="4.5" />
        <circle cx="28.5" cy="112" r="5.2" />
        <circle cx="71.5" cy="112" r="5.2" />

        {/* legs */}
        <circle cx="42" cy="99" r="8" />
        <circle cx="58" cy="99" r="8" />
        <rect x="34.5" y="100" width="15" height="42" rx="7.5" />
        <rect x="50.5" y="100" width="15" height="42" rx="7.5" />
        <circle cx="42" cy="143" r="6.2" />
        <circle cx="58" cy="143" r="6.2" />
        <rect x="36" y="144" width="12" height="34" rx="6" />
        <rect x="52" y="144" width="12" height="34" rx="6" />
        <rect x="34" y="176" width="16" height="7" />
        <rect x="50" y="176" width="16" height="7" />
      </g>

      {/* Station line, the same device as the spec sheet. */}
      <line x1="8" y1="6" x2="8" y2="184" strokeWidth="0.5" opacity="0.45" />
      <line x1="6" y1="6" x2="10" y2="6" strokeWidth="0.5" opacity="0.45" />
      <line x1="6" y1="184" x2="10" y2="184" strokeWidth="0.5" opacity="0.45" />
    </svg>
  );
}
