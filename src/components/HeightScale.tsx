import { ASSET_FRAMES } from "@/content/asset-series";

/** Measurement is HTML/SVG, never burned into an actor's downloadable image. */
export function HeightScale({ heightCm }: { heightCm: number }) {
  const { crownPct, solePct } = ASSET_FRAMES.full;
  const max = Math.ceil((heightCm + 20) / 10) * 10;
  const y = (cm: number) => solePct - (cm / heightCm) * (solePct - crownPct);
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 left-3 h-full w-12 overflow-visible text-muted-foreground opacity-35"
      viewBox="0 0 48 1000"
      preserveAspectRatio="none"
      aria-label={`${heightCm} CM`}
    >
      <line
        x1="38"
        x2="38"
        y1={Math.max(0, y(max)) * 10}
        y2={solePct * 10}
        stroke="currentColor"
        strokeWidth="1"
      />
      {Array.from({ length: Math.floor(max / 10) + 1 }, (_, index) => index * 10)
        .filter((cm) => y(cm) >= 0)
        .map((cm) => (
          <g key={cm}>
            <line
              x1={cm % 50 === 0 ? 27 : 32}
              x2="38"
              y1={y(cm) * 10}
              y2={y(cm) * 10}
              stroke="currentColor"
              strokeWidth="1"
            />
            {cm % 50 === 0 ? (
              <text
                x="23"
                y={y(cm) * 10}
                textAnchor="end"
                dominantBaseline="middle"
                className="font-mono"
                fontSize="15"
              >
                {cm}
              </text>
            ) : null}
          </g>
        ))}
    </svg>
  );
}
