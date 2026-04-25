"use client";

import type { ZodSchema } from "zod";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "../schema";
import { Field } from "../components/Field";
import type {
  ApplicationField,
  ApplicationFormState,
} from "../hooks/useApplicationDraft";
import type { EmailAvailability } from "../hooks/useEmailAvailability";

/**
 * Step registry.
 *
 * Why a registry (not `step === N && <JSX>`):
 * - The orchestrator iterates over a single source of truth: title, view,
 *   validator. Adding a step is one entry; removing is the inverse.
 * - Each entry pairs a Zod schema with the fields it owns, so validation
 *   is data, not control flow.
 */

// ─── Types ───────────────────────────────────────────────────────────────────
type SetField = <K extends ApplicationField>(
  field: K,
  value: ApplicationFormState[K]
) => void;

export type StepViewProps = {
  form: ApplicationFormState;
  setField: SetField;
  flushDraft: () => void;
  emailStatus: EmailAvailability;
  onSubmitEnter: () => void;
};

type StepDefinition = {
  /** Roman-numeral label rendered in the indicator. */
  label: string;
  /** Korean section title rendered above the view. */
  title: string;
  /** The fields this step owns — used to slice state for validation. */
  fields: readonly ApplicationField[];
  /** Schema run against the slice. Pure, testable. */
  schema: ZodSchema;
  /** The view itself. Receives the same props for every step. */
  View: (props: StepViewProps) => React.ReactNode;
};

// ─── Step views ──────────────────────────────────────────────────────────────

function BasicInfoView({
  form,
  setField,
  flushDraft,
  emailStatus,
  onSubmitEnter,
}: StepViewProps) {
  return (
    <div className="space-y-6">
      <Field.Text
        label="이름"
        value={form.name}
        onChange={(v) => setField("name", v)}
        onBlur={flushDraft}
        onSubmit={onSubmitEnter}
        placeholder="홍길동"
        maxLength={60}
      />
      <Field.Text
        label="이메일"
        type="email"
        value={form.email}
        onChange={(v) => setField("email", v)}
        onBlur={flushDraft}
        onSubmit={onSubmitEnter}
        placeholder="you@example.com"
        maxLength={200}
        hint={<EmailHint status={emailStatus} />}
      />
      <Field.Text
        label="현재 역할"
        value={form.role}
        onChange={(v) => setField("role", v)}
        onBlur={flushDraft}
        onSubmit={onSubmitEnter}
        placeholder="프로덕트 디자이너"
        maxLength={80}
      />
      <Field.Text
        label="산업"
        value={form.industry}
        onChange={(v) => setField("industry", v)}
        onBlur={flushDraft}
        onSubmit={onSubmitEnter}
        placeholder="핀테크"
        maxLength={60}
      />
    </div>
  );
}

function EmailHint({ status }: { status: EmailAvailability }) {
  if (status === "checking")
    return (
      <p className="mt-2 text-[0.85rem] font-sans text-subtle">확인 중...</p>
    );
  if (status === "taken")
    return (
      <p className="mt-2 text-[0.85rem] font-sans text-[#a23838]">
        이미 접수된 이메일입니다.
      </p>
    );
  if (status === "available")
    return (
      <p className="mt-2 text-[0.85rem] font-sans text-[#3a6a3a]">
        사용 가능한 이메일입니다.
      </p>
    );
  return null;
}

function EssayValuesView({ form, setField, flushDraft }: StepViewProps) {
  return (
    <div className="space-y-4">
      <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-4">
        당신의 가치관을 형성한 책과 그 이유를 서술해 주세요.
      </p>
      <p className="text-[0.9rem] font-serif text-muted mb-3 italic">
        논문이 아닌, 서재 앞에서 건네는 편지처럼.
      </p>
      <div>
        <Field.Textarea
          value={form.essayValues}
          onChange={(v) => setField("essayValues", v)}
          onBlur={flushDraft}
          maxLength={3000}
        />
        <Field.Counter current={form.essayValues.length} min={400} max={3000} />
      </div>
    </div>
  );
}

function EssayGrowthView({ form, setField, flushDraft }: StepViewProps) {
  return (
    <div className="space-y-4">
      <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-6">
        최근 1년간 당신의 지적 성장을 가장 크게 자극한 대화 혹은 경험을 소개해
        주세요.
      </p>
      <div>
        <Field.Textarea
          value={form.essayGrowth}
          onChange={(v) => setField("essayGrowth", v)}
          onBlur={flushDraft}
          maxLength={3000}
        />
        <Field.Counter current={form.essayGrowth.length} min={300} max={3000} />
      </div>
    </div>
  );
}

function ReferralView({
  form,
  setField,
  flushDraft,
  onSubmitEnter,
}: StepViewProps) {
  return (
    <div className="space-y-4">
      <p className="font-serif text-ink text-[1.125rem] leading-[1.7] mb-2">
        우리를 어떻게 알게 되셨습니까?
      </p>
      <p className="text-[0.9rem] font-sans text-muted mb-4">
        추천인이 있다면 성함을 적어 주세요. (선택)
      </p>
      <Field.Text
        value={form.referral}
        onChange={(v) => setField("referral", v)}
        onBlur={flushDraft}
        onSubmit={onSubmitEnter}
        placeholder="홍길동 님의 소개"
        maxLength={200}
      />
    </div>
  );
}

function PreviewView({ form }: StepViewProps) {
  return (
    <div className="space-y-8">
      <PreviewItem label="이름" value={form.name} />
      <PreviewItem label="이메일" value={form.email} />
      <PreviewItem label="현재 역할" value={form.role} />
      <PreviewItem label="산업" value={form.industry} />
      <PreviewItem
        label="에세이 I"
        value={form.essayValues}
        longText
        prompt="당신의 가치관을 형성한 책과 그 이유를 서술해 주세요."
      />
      <PreviewItem
        label="에세이 II"
        value={form.essayGrowth}
        longText
        prompt="최근 1년간 당신의 지적 성장을 가장 크게 자극한 대화 혹은 경험을 소개해 주세요."
      />
      {form.referral && <PreviewItem label="연결고리" value={form.referral} />}
    </div>
  );
}

function PreviewItem({
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

// ─── Registry ────────────────────────────────────────────────────────────────
// Step 5 (Preview) has no schema — the previous four schemas already
// constrain the data, and the preview is read-only by design.

export const STEPS: readonly StepDefinition[] = [
  {
    label: "I",
    title: "기본 정보",
    fields: ["name", "email", "role", "industry"],
    schema: step1Schema,
    View: BasicInfoView,
  },
  {
    label: "II",
    title: "에세이 I",
    fields: ["essayValues"],
    schema: step2Schema,
    View: EssayValuesView,
  },
  {
    label: "III",
    title: "에세이 II",
    fields: ["essayGrowth"],
    schema: step3Schema,
    View: EssayGrowthView,
  },
  {
    label: "IV",
    title: "연결고리",
    fields: ["referral"],
    schema: step4Schema,
    View: ReferralView,
  },
  {
    label: "V",
    title: "제출 확인",
    fields: [],
    schema: undefined as unknown as ZodSchema, // preview — see isStepValid below
    View: PreviewView,
  },
] as const;

/**
 * Slice the form to the fields a step owns and validate.
 * Returns true for the preview step (no schema = no constraint here).
 */
export function isStepValid(
  index: number,
  form: ApplicationFormState
): boolean {
  const step = STEPS[index];
  if (!step || !step.schema) return true;
  const slice: Partial<ApplicationFormState> = {};
  for (const f of step.fields) slice[f] = form[f];
  return step.schema.safeParse(slice).success;
}
