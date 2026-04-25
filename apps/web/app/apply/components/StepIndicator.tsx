"use client";

type Props = {
  /** 0-based index of the active step. */
  activeIndex: number;
  /** Roman-numeral labels in order. */
  labels: readonly string[];
};

/**
 * Progress indicator. Pure presentational — owns no state, derives every
 * style from `activeIndex` so the parent never has to compute "isActive".
 */
export function StepIndicator({ activeIndex, labels }: Props) {
  return (
    <div className="flex items-center gap-6 mb-12 justify-center">
      {labels.map((label, i) => {
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={[
                "text-base font-serif tracking-wider transition-colors",
                isActive
                  ? "text-brass-strong font-semibold"
                  : isCompleted
                    ? "text-ink"
                    : "text-subtle",
              ].join(" ")}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <span className="text-subtle text-sm">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
