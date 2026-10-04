import { CopyButton } from "./CopyButton";

/** Visible, selectable text survives a denied clipboard permission. */
export function CopyBlock({ text, label }: { text: string; label: string }) {
  return (
    <div className="sp-card bg-muted">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="sp-code">{label}</span>
        <CopyButton text={text} />
      </div>
      <p className="mt-4 max-h-64 overflow-y-auto font-mono text-[13px] leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
