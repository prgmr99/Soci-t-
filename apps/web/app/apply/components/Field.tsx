"use client";

import type { ReactNode } from "react";

/**
 * Domain-optimised form primitives.
 *
 * Why a `Field.*` namespace (not raw <input>/<textarea>):
 * - The form should speak in domain terms — `value: string`,
 *   `onChange: (value) => void` — not in DOM events. Centralising the
 *   `e.target.value` unwrap means a step component never holds a stray
 *   `e.preventDefault` or worries about textarea vs input distinctions.
 * - Editorial styling tokens (paper background, brass border, mono label,
 *   serif body for essays) are owned here. Touching the typography in one
 *   place is cheaper than auditing every step.
 * - Compound naming (`Field.Text`, `Field.Textarea`, `Field.Counter`) makes
 *   the JSX read top-to-bottom in the same shape as the rendered UI.
 */

// ─── Tokens ──────────────────────────────────────────────────────────────────
const inputClass =
  "w-full bg-paper border border-brass/35 rounded-[3px] px-4 py-3.5 text-ink font-sans text-base leading-relaxed focus:outline-none focus:border-brass-strong transition-colors placeholder:text-subtle";

const textareaClass =
  "w-full bg-paper border border-brass/35 rounded-[3px] px-6 py-6 text-ink font-serif text-[1.0625rem] leading-[1.75] focus:outline-none focus:border-brass-strong transition-colors resize-none placeholder:text-subtle placeholder:font-serif";

const labelClass =
  "block text-[0.78rem] tracking-[0.14em] uppercase text-muted mb-2.5 font-mono";

// ─── Field.Label ─────────────────────────────────────────────────────────────
function Label({ children }: { children: ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

// ─── Field.Text ──────────────────────────────────────────────────────────────
type TextProps = {
  /** Visible label rendered above the input. Optional for tightly grouped fields. */
  label?: string;
  /** Domain value — string only. The wrapper handles `e.target.value`. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Submit on Enter. */
  onSubmit?: () => void;
  type?: "text" | "email";
  placeholder?: string;
  maxLength?: number;
  /** Status-coloured hint slot rendered below the input. */
  hint?: ReactNode;
};

function Text({
  label,
  value,
  onChange,
  onBlur,
  onSubmit,
  type = "text",
  placeholder,
  maxLength,
  hint,
}: TextProps) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {hint}
    </div>
  );
}

// ─── Field.Textarea ──────────────────────────────────────────────────────────
type TextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
};

function Textarea({
  value,
  onChange,
  onBlur,
  rows = 14,
  placeholder = "...",
  maxLength,
}: TextareaProps) {
  return (
    <textarea
      className={textareaClass}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

// ─── Field.Counter ───────────────────────────────────────────────────────────
type CounterProps = {
  current: number;
  min: number;
  max: number;
};

function Counter({ current, min, max }: CounterProps) {
  const reachedMin = current >= min;
  return (
    <p
      className={[
        "mt-2.5 text-right text-[0.8rem] font-mono tabular-nums",
        reachedMin ? "text-brass-strong" : "text-subtle",
      ].join(" ")}
    >
      {current.toLocaleString()} / {max.toLocaleString()}
      {!reachedMin && ` (최소 ${min.toLocaleString()}자)`}
    </p>
  );
}

// ─── Namespace export ────────────────────────────────────────────────────────
export const Field = {
  Label,
  Text,
  Textarea,
  Counter,
};
