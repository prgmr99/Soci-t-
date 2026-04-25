// Skeleton shown while the submitted page's async searchParams resolve.
// Mirrors the Ticket aspect ratio (8:5) to prevent layout shift.

export default function SubmittedLoading() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-[120px]">
      {/* Header skeleton */}
      <div className="mb-3 h-3 w-32 animate-pulse rounded-[1px] bg-ink/10" />

      {/* Title skeleton */}
      <div className="mb-2 h-8 w-72 animate-pulse rounded-[1px] bg-ink/10" />
      <div className="mb-1 h-8 w-52 animate-pulse rounded-[1px] bg-ink/10" />

      {/* Body text skeleton */}
      <div className="mb-10 mt-6 flex flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded-[1px] bg-ink/6" />
        <div className="h-4 w-5/6 animate-pulse rounded-[1px] bg-ink/6" />
        <div className="h-4 w-4/6 animate-pulse rounded-[1px] bg-ink/6" />
      </div>

      {/* Ticket placeholder — fixed aspect ratio to prevent CLS */}
      <div
        className="w-full animate-pulse rounded-[2px] bg-ink/6"
        style={{ aspectRatio: "8 / 5" }}
        aria-hidden="true"
      />

      {/* Action row skeleton */}
      <div className="mt-8 flex flex-col gap-3">
        <div className="h-3 w-64 animate-pulse rounded-[1px] bg-ink/8" />
        <div className="h-3 w-16 animate-pulse rounded-[1px] bg-ink/8" />
      </div>
    </div>
  );
}
