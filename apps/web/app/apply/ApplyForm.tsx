"use client";

import { useRef, useState, useCallback, useTransition } from "react";
import { step1Schema, step2Schema, step3Schema, step4Schema } from "./schema";
import { checkEmailAvailable, submitApplication } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FormState = {
  name: string;
  email: string;
  role: string;
  industry: string;
  essayValues: string;
  essayGrowth: string;
  referral: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  role: "",
  industry: "",
  essayValues: "",
  essayGrowth: "",
  referral: "",
};

const DRAFT_KEY = "societe:application:draft:v1";

// ---------------------------------------------------------------------------
// Step labels (roman numerals)
// ---------------------------------------------------------------------------
const STEP_LABELS = ["I", "II", "III", "IV", "V"] as const;
const STEP_TITLES = [
  "기본 정보",
  "에세이 I",
  "에세이 II",
  "연결고리",
  "제출 확인",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function saveDraft(state: FormState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {}
}

function loadDraft(): FormState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FormState;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function isDraftEmpty(draft: FormState): boolean {
  return Object.values(draft).every((v) => v === "");
}

// ---------------------------------------------------------------------------
// Validation per step
// ---------------------------------------------------------------------------
function validateStep(step: number, state: FormState): string | null {
  if (step === 1) {
    const result = step1Schema.safeParse({
      name: state.name,
      email: state.email,
      role: state.role,
      industry: state.industry,
    });
    return result.success ? null : (result.error.errors[0]?.message ?? "입력값을 확인해 주세요.");
  }
  if (step === 2) {
    const result = step2Schema.safeParse({ essayValues: state.essayValues });
    return result.success ? null : (result.error.errors[0]?.message ?? "입력값을 확인해 주세요.");
  }
  if (step === 3) {
    const result = step3Schema.safeParse({ essayGrowth: state.essayGrowth });
    return result.success ? null : (result.error.errors[0]?.message ?? "입력값을 확인해 주세요.");
  }
  if (step === 4) {
    const result = step4Schema.safeParse({ referral: state.referral });
    return result.success ? null : (result.error.errors[0]?.message ?? "입력값을 확인해 주세요.");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
// Initialise draft state on first render (SSR-safe: returns null on server)
function initDraft(): { draft: FormState | null; showBanner: boolean } {
  if (typeof window === "undefined") return { draft: null, showBanner: false };
  const draft = loadDraft();
  if (draft && !isDraftEmpty(draft)) return { draft, showBanner: true };
  return { draft: null, showBanner: false };
}

export default function ApplyForm() {
  const [step, setStep] = useState(1);
  // Lazy initializer runs once — safe, no effect needed
  const [{ draft: initialDraft, showBanner: initialBanner }] = useState(initDraft);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [draftBanner, setDraftBanner] = useState(initialBanner);
  const [pendingDraft, setPendingDraft] = useState<FormState | null>(initialDraft);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave on idle (3s after last change)
  const scheduleAutosave = useCallback(
    (state: FormState) => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        saveDraft(state);
      }, 3000);
    },
    []
  );

  function handleChange(field: keyof FormState, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    scheduleAutosave(next);
    if (field === "email") {
      setEmailStatus("idle");
      if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
      emailDebounceRef.current = setTimeout(async () => {
        const emailResult = step1Schema.shape.email.safeParse(value);
        if (!emailResult.success) return;
        setEmailStatus("checking");
        const res = await checkEmailAvailable(value);
        setEmailStatus(res.available ? "available" : "taken");
      }, 600);
    }
  }

  function handleBlur(state: FormState) {
    saveDraft(state);
  }

  function handleResumeDraft() {
    if (pendingDraft) {
      setForm(pendingDraft);
    }
    setDraftBanner(false);
    setPendingDraft(null);
  }

  function handleNewStart() {
    clearDraft();
    setForm(EMPTY);
    setDraftBanner(false);
    setPendingDraft(null);
  }

  const stepValid = validateStep(step, form) === null && (step !== 1 || emailStatus !== "taken");

  function handleNext() {
    if (!stepValid) return;
    setStep((s) => Math.min(s + 1, 5));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (stepValid) handleNext();
    }
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("role", form.role);
    fd.append("industry", form.industry);
    fd.append("essayValues", form.essayValues);
    fd.append("essayGrowth", form.essayGrowth);
    fd.append("referral", form.referral);
    fd.append("_hp", ""); // honeypot always empty from legit submissions

    startTransition(async () => {
      const result = await submitApplication(fd);
      // If we reach here, it means redirect didn't happen (error case)
      if (result && !result.ok) {
        setSubmitError(result.error);
        setIsSubmitting(false);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const inputBase =
    "w-full bg-paper border border-brass/35 rounded-[3px] px-4 py-3.5 text-ink font-sans text-base leading-relaxed focus:outline-none focus:border-brass-strong transition-colors placeholder:text-subtle";
  const textareaBase =
    "w-full bg-paper border border-brass/35 rounded-[3px] px-6 py-6 text-ink font-serif text-[1.0625rem] leading-[1.75] focus:outline-none focus:border-brass-strong transition-colors resize-none placeholder:text-subtle placeholder:font-serif";
  const labelBase = "block text-[0.78rem] tracking-[0.14em] uppercase text-muted mb-2.5 font-mono";
  const btnPrimary =
    "min-h-12 rounded-[3px] px-8 py-3.5 bg-ink text-paper text-[0.9rem] tracking-[0.12em] uppercase font-sans font-semibold hover:bg-[#1a1a1b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const btnSecondary =
    "min-h-12 rounded-[3px] px-8 py-3.5 border border-brass/40 text-muted text-[0.9rem] tracking-[0.12em] uppercase font-sans font-medium hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-paper-soft py-16 px-4">
      {/* Draft banner */}
      {draftBanner && (
        <div className="fixed top-0 inset-x-0 z-50 bg-ink text-paper px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-[0.95rem] font-sans">드래프트가 저장되어 있습니다. 이어서 쓰시겠습니까?</p>
          <div className="flex gap-4">
            <button
              onClick={handleResumeDraft}
              className="text-[0.95rem] font-sans underline underline-offset-4 hover:text-brass transition-colors"
            >
              이어쓰기
            </button>
            <button
              onClick={handleNewStart}
              className="text-[0.95rem] font-sans text-paper/70 hover:text-paper transition-colors"
            >
              새로 시작
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center gap-6 mb-12 justify-center">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isCompleted = n < step;
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
                {i < 4 && (
                  <span className="text-subtle text-sm">·</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Step title */}
        <h2 className="text-[1.5rem] font-serif text-ink mb-8 text-center tracking-[-0.005em]">
          {STEP_TITLES[step - 1] ?? ""}
        </h2>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className={labelBase}>이름</label>
              <input
                type="text"
                className={inputBase}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur(form)}
                onKeyDown={handleKeyDown}
                placeholder="홍길동"
                maxLength={60}
              />
            </div>
            <div>
              <label className={labelBase}>이메일</label>
              <input
                type="email"
                className={inputBase}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur(form)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                maxLength={200}
              />
              {emailStatus === "checking" && (
                <p className="mt-2 text-[0.85rem] font-sans text-subtle">확인 중...</p>
              )}
              {emailStatus === "taken" && (
                <p className="mt-2 text-[0.85rem] font-sans text-[#a23838]">이미 접수된 이메일입니다.</p>
              )}
              {emailStatus === "available" && (
                <p className="mt-2 text-[0.85rem] font-sans text-[#3a6a3a]">사용 가능한 이메일입니다.</p>
              )}
            </div>
            <div>
              <label className={labelBase}>현재 역할</label>
              <input
                type="text"
                className={inputBase}
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                onBlur={() => handleBlur(form)}
                onKeyDown={handleKeyDown}
                placeholder="프로덕트 디자이너"
                maxLength={80}
              />
            </div>
            <div>
              <label className={labelBase}>산업</label>
              <input
                type="text"
                className={inputBase}
                value={form.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                onBlur={() => handleBlur(form)}
                onKeyDown={handleKeyDown}
                placeholder="핀테크"
                maxLength={60}
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-4">
              당신의 가치관을 형성한 책과 그 이유를 서술해 주세요.
            </p>
            <p className="text-[0.9rem] font-serif text-muted mb-3 italic">
              논문이 아닌, 서재 앞에서 건네는 편지처럼.
            </p>
            <div>
              <textarea
                className={textareaBase}
                rows={14}
                value={form.essayValues}
                onChange={(e) => handleChange("essayValues", e.target.value)}
                onBlur={() => handleBlur(form)}
                placeholder="..."
                maxLength={3000}
              />
              <CharCounter
                current={form.essayValues.length}
                min={400}
                max={3000}
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-6">
              최근 1년간 당신의 지적 성장을 가장 크게 자극한 대화 혹은 경험을 소개해 주세요.
            </p>
            <div>
              <textarea
                className={textareaBase}
                rows={14}
                value={form.essayGrowth}
                onChange={(e) => handleChange("essayGrowth", e.target.value)}
                onBlur={() => handleBlur(form)}
                placeholder="..."
                maxLength={3000}
              />
              <CharCounter
                current={form.essayGrowth.length}
                min={300}
                max={3000}
              />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-2">
              우리를 어떻게 알게 되셨습니까?
            </p>
            <p className="text-[0.9rem] font-sans text-muted mb-4">
              추천인이 있다면 성함을 적어 주세요. (선택)
            </p>
            <input
              type="text"
              className={inputBase}
              value={form.referral}
              onChange={(e) => handleChange("referral", e.target.value)}
              onBlur={() => handleBlur(form)}
              onKeyDown={handleKeyDown}
              placeholder="홍길동 님의 소개"
              maxLength={200}
            />
          </div>
        )}

        {/* Step 5 — Preview */}
        {step === 5 && (
          <div className="space-y-8">
            <PreviewSection label="이름" value={form.name} />
            <PreviewSection label="이메일" value={form.email} />
            <PreviewSection label="현재 역할" value={form.role} />
            <PreviewSection label="산업" value={form.industry} />
            <PreviewSection
              label="에세이 I"
              value={form.essayValues}
              longText
              prompt="당신의 가치관을 형성한 책과 그 이유를 서술해 주세요."
            />
            <PreviewSection
              label="에세이 II"
              value={form.essayGrowth}
              longText
              prompt="최근 1년간 당신의 지적 성장을 가장 크게 자극한 대화 혹은 경험을 소개해 주세요."
            />
            {form.referral && (
              <PreviewSection label="연결고리" value={form.referral} />
            )}
            {submitError && (
              <p className="text-[0.95rem] font-sans text-[#a23838] text-center">{submitError}</p>
            )}
          </div>
        )}

        {/* Honeypot — visually hidden */}
        <div
          style={{ position: "absolute", left: "-9999px" }}
          aria-hidden="true"
        >
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-brass/30">
          <button
            className={btnSecondary}
            onClick={handleBack}
            disabled={step === 1}
          >
            이전
          </button>

          {step < 5 ? (
            <button
              className={btnPrimary}
              onClick={handleNext}
              disabled={!stepValid}
            >
              다음
            </button>
          ) : (
            <button
              className={btnPrimary}
              onClick={handleSubmit}
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending ? "심사 대기권 발급 중..." : "제출하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function CharCounter({
  current,
  min,
  max,
}: {
  current: number;
  min: number;
  max: number;
}) {
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

function PreviewSection({
  label,
  value,
  longText = false,
  prompt,
}: {
  label: string;
  value: string;
  longText?: boolean;
  prompt?: string;
}) {
  return (
    <div>
      <p className="text-[0.78rem] font-mono tracking-[0.14em] uppercase text-brass-strong mb-2">
        {label}
      </p>
      {prompt && (
        <p className="font-serif text-[1rem] text-muted mb-3 leading-[1.6] italic">
          {prompt}
        </p>
      )}
      {longText ? (
        <p className="font-serif text-[1.0625rem] leading-[1.8] text-ink whitespace-pre-wrap">
          {value}
        </p>
      ) : (
        <p className="font-sans text-[1rem] text-ink">{value}</p>
      )}
    </div>
  );
}
