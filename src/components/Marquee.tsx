/**
 * Ticker rail. Pure CSS translate on a duplicated track so it loops with no
 * JS and no layout thrash. `aria-hidden` on the clone keeps screen readers
 * from reading the line twice.
 */
export function Marquee({
  items,
  tone = "acid",
  speed = 42,
}: {
  items: string[];
  tone?: "acid" | "bone" | "cyan";
  speed?: number;
}) {
  const color = tone === "acid" ? "text-acid" : tone === "cyan" ? "text-cyan" : "text-bone";
  const track = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden border-y border-[var(--sp-hairline)] py-3">
      <div
        className={`flex shrink-0 items-center gap-8 whitespace-nowrap ${color}`}
        style={{ animation: `sp-marquee ${speed}s linear infinite`, willChange: "transform" }}
      >
        {track.map((item, i) => (
          <span
            key={i}
            className="sp-label flex items-center gap-8 text-[0.6875rem]"
            aria-hidden={i >= items.length}
          >
            {item}
            <span className="text-ash">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
