import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketProps {
  status: "pending" | "approved";
  name?: string;
  issuedAt: string; // ISO 8601
  serial: string;   // e.g., S-2026-000123
  className?: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format ISO date as "2026년 4월 23일" */
function formatKoreanDate(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/** Deterministic barcode widths from serial string hash */
function barWidths(serial: string, count = 30): number[] {
  const seed = Array.from(serial).reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7);
  const widths: number[] = [];
  let state = seed >>> 0;
  for (let i = 0; i < count; i++) {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = state >>> 0;
    // Widths: 1, 2, or 3px
    widths.push((state % 3) + 1);
  }
  return widths;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrassLine() {
  return (
    <div
      aria-hidden="true"
      className="h-[2px] w-full bg-brass opacity-70"
    />
  );
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="ticket-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#ticket-grain)" />
    </svg>
  );
}

function BrassSeals() {
  // Approved-only: a small brass wax-seal SVG in the right column bottom
  return (
    <svg
      aria-hidden="true"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-80"
    >
      <circle cx="18" cy="18" r="16" stroke="#9a7d3d" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="10" stroke="#9a7d3d" strokeWidth="0.75" />
      {/* Star/compass points */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 18 + Math.cos(rad) * 12;
        const y1 = 18 + Math.sin(rad) * 12;
        const x2 = 18 + Math.cos(rad) * 10;
        const y2 = 18 + Math.sin(rad) * 10;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#9a7d3d"
            strokeWidth="1"
          />
        );
      })}
      <text
        x="18"
        y="20.5"
        textAnchor="middle"
        fontSize="5"
        fontFamily="monospace"
        fill="#9a7d3d"
        letterSpacing="0.5"
      >
        SCT
      </text>
    </svg>
  );
}

function BarcodePattern({ serial }: { serial: string }) {
  const widths = barWidths(serial);
  // Total visual width ≈ sum of widths + gaps
  // Render as a compact SVG fitting the column
  const totalWidth = widths.reduce((a, b) => a + b, 0) + widths.length - 1;
  let x = 0;
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="40"
      viewBox={`0 0 ${totalWidth} 40`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-40"
    >
      {widths.map((w, i) => {
        const rect = (
          <rect
            key={i}
            x={x}
            y={0}
            width={w}
            height={40}
            fill="#0b0b0c"
          />
        );
        x += w + 1;
        return rect;
      })}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Ticket({ status, name, issuedAt, serial, className }: TicketProps) {
  const isApproved = status === "approved";
  const formattedDate = formatKoreanDate(issuedAt);
  const titleText = isApproved ? "입회 허가증" : "인비테이션 대기권";
  const headerLabel = isApproved ? "SOCIÉTÉ · APPROVED TICKET" : "SOCIÉTÉ · WAITLIST TICKET";
  const nameOrSerial = name ? name : `N° ${serial}`;
  const statusLabel = isApproved ? "STATUS · APPROVED" : "STATUS · PENDING";

  return (
    <div
      role="img"
      aria-label={`Société ${isApproved ? "입회 허가증" : "심사 대기권"} — ${serial}`}
      className={cn(
        // Fixed 8:5 aspect ratio → CLS 0
        "relative aspect-[8/5] w-full overflow-hidden",
        // Paper-soft background, thin ink border, barely rounded
        "rounded-[2px] border border-ink/15 bg-paper-soft",
        // Inset shadow for depth
        "shadow-[inset_0_0_0_1px_rgba(11,11,12,0.04),0_1px_4px_rgba(11,11,12,0.06)]",
        className
      )}
    >
      {/* Grain texture overlay — self-contained SVG filter */}
      <GrainOverlay />

      {/* Inner layout: flex row */}
      <div className="relative flex h-full w-full">

        {/* ── Left column (2/3 width) ─────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-between px-5 py-4">

          {/* Top: header label */}
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "font-mono text-[0.55rem] uppercase tracking-[0.22em]",
                isApproved ? "text-brass" : "text-muted"
              )}
            >
              {headerLabel}
            </span>

            {/* Brass accent hairline */}
            <BrassLine />
          </div>

          {/* Mid: large serif title */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-[clamp(1rem,2.5vw,1.6rem)] leading-[1.0] tracking-[-0.02em] text-ink">
              {titleText}
            </h2>

            {/* Body: name / serial + date */}
            <div className="flex flex-col gap-0.5">
              <p className="font-serif text-[clamp(0.65rem,1.2vw,0.85rem)] leading-snug tracking-[-0.01em] text-ink/80">
                {nameOrSerial}
              </p>
              <p className="font-sans text-[clamp(0.55rem,0.9vw,0.7rem)] text-muted">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Bottom: roman-numeric edition in mono */}
          <div>
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted/70">
              ÉDITION · MMXXVI
            </span>
          </div>
        </div>

        {/* ── Perforation separator ───────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="flex flex-col items-center justify-between py-3"
        >
          {/* Dashed vertical line */}
          <div
            className="h-full w-[1px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, #0b0b0c22 0px, #0b0b0c22 4px, transparent 4px, transparent 8px)",
            }}
          />
        </div>

        {/* ── Right column (1/3 width) ─────────────────────────────────────── */}
        <div
          className="flex w-[32%] flex-col items-center justify-between py-4 pl-3 pr-4"
          style={{ minWidth: 0 }}
        >

          {/* Status badge */}
          <div className="flex w-full flex-col items-end gap-0.5">
            <span
              className={cn(
                "font-mono text-[0.5rem] uppercase tracking-[0.2em]",
                isApproved ? "text-brass font-medium" : "text-muted"
              )}
            >
              {statusLabel}
            </span>
            {isApproved && (
              <div className="mt-0.5 h-[1px] w-full bg-brass opacity-60" />
            )}
          </div>

          {/* Vertical serial */}
          <div
            className="flex flex-1 items-center justify-center overflow-hidden"
            aria-label={`일련번호 ${serial}`}
          >
            <span
              className="font-mono text-[0.5rem] tracking-[0.12em] text-muted/60"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                letterSpacing: "0.18em",
              }}
            >
              {serial}
            </span>
          </div>

          {/* Barcode-like pattern */}
          <div className="w-full">
            <BarcodePattern serial={serial} />
          </div>

          {/* Approved seal or spacer */}
          <div className="flex items-end justify-center pt-1">
            {isApproved ? (
              <BrassSeals />
            ) : (
              <div className="h-[36px] w-[36px]" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
