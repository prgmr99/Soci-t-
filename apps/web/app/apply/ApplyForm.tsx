"use client";

import { useMemo, useState, useTransition } from "react";
import { submitApplication } from "./actions";
import { Field } from "./components/Field";
import { DraftBanner } from "./components/DraftBanner";
import { StepIndicator } from "./components/StepIndicator";
import { useApplicationDraft } from "./hooks/useApplicationDraft";
import { useEmailAvailability } from "./hooks/useEmailAvailability";
import { STEPS, isStepValid } from "./steps";

const LAST_INDEX = STEPS.length - 1;
const STEP_LABELS = STEPS.map((s) => s.label);

/**
 * Five-step membership application wizard.
 *
 * Why this orchestrator stays thin:
 * - Draft + autosave live in `useApplicationDraft`.
 * - Email-uniqueness debounce lives in `useEmailAvailability`.
 * - Step views + per-step validation live in `STEPS`.
 * The orchestrator only owns "which step am I on?" and "submit".
 */
export default function ApplyForm() {
  const { form, setField, flushDraft, pendingDraft, resumeDraft, discardDraft } =
    useApplicationDraft();

  const emailStatus = useEmailAvailability(form.email);

  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const step = STEPS[stepIndex]!;
  const isLast = stepIndex === LAST_INDEX;

  // Step validity is data-derived: the schema for this step + the email
  // uniqueness gate (only step 0 is sensitive to it).
  const stepValid = useMemo(() => {
    if (!isStepValid(stepIndex, form)) return false;
    if (stepIndex === 0 && emailStatus === "taken") return false;
    return true;
  }, [stepIndex, form, emailStatus]);

  function goNext() {
    if (!stepValid) return;
    setStepIndex((i) => Math.min(i + 1, LAST_INDEX));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function submit() {
    setSubmitError(null);
    setIsSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("_hp", ""); // honeypot — always empty from legit submissions

    startTransition(async () => {
      const result = await submitApplication(fd);
      // `redirect()` throws inside the action; reaching here means an error.
      if (result && !result.ok) {
        setSubmitError(result.error);
        setIsSubmitting(false);
      }
    });
  }

  const StepView = step.View;

  return (
    <div className="min-h-screen bg-paper-soft py-16 px-4">
      {pendingDraft && (
        <DraftBanner onResume={resumeDraft} onDiscard={discardDraft} />
      )}

      <div className="max-w-2xl mx-auto">
        <StepIndicator activeIndex={stepIndex} labels={STEP_LABELS} />

        <h2 className="text-[1.5rem] font-serif text-ink mb-8 text-center tracking-[-0.005em]">
          {step.title}
        </h2>

        <StepView
          form={form}
          setField={setField}
          flushDraft={flushDraft}
          emailStatus={emailStatus}
          onSubmitEnter={goNext}
        />

        {isLast && submitError && (
          <p className="mt-6 text-[0.95rem] font-sans text-[#a23838] text-center">
            {submitError}
          </p>
        )}

        {/* Honeypot — visually hidden, name matches `_hp` in the action */}
        <div
          style={{ position: "absolute", left: "-9999px" }}
          aria-hidden="true"
        >
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
        </div>

        <NavBar
          stepIndex={stepIndex}
          isLast={isLast}
          stepValid={stepValid}
          isBusy={isSubmitting || isPending}
          onBack={goBack}
          onNext={goNext}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}

// ─── NavBar ──────────────────────────────────────────────────────────────────
// Kept inline because it's coupled 1:1 to the wizard's two actions.

const btnPrimary =
  "min-h-12 rounded-[3px] px-8 py-3.5 bg-ink text-paper text-[0.9rem] tracking-[0.12em] uppercase font-sans font-semibold hover:bg-[#1a1a1b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnSecondary =
  "min-h-12 rounded-[3px] px-8 py-3.5 border border-brass/40 text-muted text-[0.9rem] tracking-[0.12em] uppercase font-sans font-medium hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

function NavBar({
  stepIndex,
  isLast,
  stepValid,
  isBusy,
  onBack,
  onNext,
  onSubmit,
}: {
  stepIndex: number;
  isLast: boolean;
  stepValid: boolean;
  isBusy: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-brass/30">
      <button className={btnSecondary} onClick={onBack} disabled={stepIndex === 0}>
        이전
      </button>
      {isLast ? (
        <button className={btnPrimary} onClick={onSubmit} disabled={isBusy}>
          {isBusy ? "심사 대기권 발급 중..." : "제출하기"}
        </button>
      ) : (
        <button className={btnPrimary} onClick={onNext} disabled={!stepValid}>
          다음
        </button>
      )}
    </div>
  );
}

// Re-export so consumers can keep using `Field` from the same module if needed.
export { Field };
