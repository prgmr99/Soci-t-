import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { STEPS, isStepValid } from "./index";
import type { StepViewProps } from "./index";
import type { ApplicationFormState } from "../hooks/useApplicationDraft";

const fullForm = {
  name: "홍길동",
  email: "hong@example.com",
  role: "프로덕트 디자이너",
  industry: "핀테크",
  essayValues: "v".repeat(500),
  essayGrowth: "g".repeat(400),
  referral: "",
};

const emptyForm = {
  name: "",
  email: "",
  role: "",
  industry: "",
  essayValues: "",
  essayGrowth: "",
  referral: "",
};

describe("STEPS registry", () => {
  it("has 5 entries with stable ordering", () => {
    expect(STEPS.map((s) => s.label)).toEqual(["I", "II", "III", "IV", "V"]);
  });

  it("attaches a Zod schema to every step except the preview", () => {
    expect(STEPS[0]?.schema).toBeDefined();
    expect(STEPS[1]?.schema).toBeDefined();
    expect(STEPS[2]?.schema).toBeDefined();
    expect(STEPS[3]?.schema).toBeDefined();
    expect(STEPS[4]?.schema).toBeUndefined();
  });
});

describe("isStepValid", () => {
  it("returns false for an empty form on every gated step", () => {
    expect(isStepValid(0, emptyForm)).toBe(false);
    expect(isStepValid(1, emptyForm)).toBe(false);
    expect(isStepValid(2, emptyForm)).toBe(false);
  });

  it("returns true for the optional referral step regardless of value", () => {
    expect(isStepValid(3, emptyForm)).toBe(true);
    expect(isStepValid(3, { ...emptyForm, referral: "친구" })).toBe(true);
  });

  it("returns true for the preview step (no schema)", () => {
    expect(isStepValid(4, emptyForm)).toBe(true);
  });

  it("only checks the slice of fields the step owns", () => {
    // Step 0 is valid even if essays are empty.
    const partial = { ...emptyForm, ...{
      name: "홍길동",
      email: "hong@example.com",
      role: "디자이너",
      industry: "핀테크",
    } };
    expect(isStepValid(0, partial)).toBe(true);
    expect(isStepValid(1, partial)).toBe(false);
  });

  it("validates the full form across all gated steps", () => {
    expect(isStepValid(0, fullForm)).toBe(true);
    expect(isStepValid(1, fullForm)).toBe(true);
    expect(isStepValid(2, fullForm)).toBe(true);
    expect(isStepValid(3, fullForm)).toBe(true);
  });

  it("returns true for an out-of-range index (no step → no constraint)", () => {
    expect(isStepValid(99, fullForm)).toBe(true);
  });
});

// ─── Step view rendering ─────────────────────────────────────────────────────
// Each registered step exposes its own view; we render them in isolation so
// the orchestrator (ApplyForm) can stay covered by the e2e suite alone.

function makeProps(
  form: ApplicationFormState,
  overrides: Partial<StepViewProps> = {},
): StepViewProps {
  return {
    form,
    setField: vi.fn(),
    flushDraft: vi.fn(),
    emailStatus: "idle",
    onSubmitEnter: vi.fn(),
    ...overrides,
  };
}

describe("BasicInfoView (step I)", () => {
  const View = STEPS[0]!.View;

  it("renders the four basic fields with their values", () => {
    render(<View {...makeProps(fullForm)} />);
    expect(screen.getByDisplayValue(fullForm.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(fullForm.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(fullForm.role)).toBeInTheDocument();
    expect(screen.getByDisplayValue(fullForm.industry)).toBeInTheDocument();
  });

  it("calls setField('name', value) on input typing", async () => {
    const setField = vi.fn();
    render(<View {...makeProps(emptyForm, { setField })} />);
    await userEvent.type(screen.getAllByRole("textbox")[0]!, "홍");
    expect(setField).toHaveBeenLastCalledWith("name", "홍");
  });

  it("renders the email-availability hint", () => {
    render(<View {...makeProps(emptyForm, { emailStatus: "checking" })} />);
    expect(screen.getByText("확인 중...")).toBeInTheDocument();

    render(<View {...makeProps(emptyForm, { emailStatus: "taken" })} />);
    expect(
      screen.getByText("이미 접수된 이메일입니다."),
    ).toBeInTheDocument();

    render(<View {...makeProps(emptyForm, { emailStatus: "available" })} />);
    expect(
      screen.getByText("사용 가능한 이메일입니다."),
    ).toBeInTheDocument();
  });
});

describe("EssayValuesView (step II)", () => {
  const View = STEPS[1]!.View;

  it("renders the essay textarea and counter", () => {
    render(<View {...makeProps({ ...fullForm, essayValues: "x".repeat(450) })} />);
    expect(
      screen.getByDisplayValue("x".repeat(450)),
    ).toBeInTheDocument();
    expect(screen.getByText(/450 \/ 3,000/)).toBeInTheDocument();
  });
});

describe("EssayGrowthView (step III)", () => {
  const View = STEPS[2]!.View;

  it("renders the second essay textarea and counter", () => {
    render(<View {...makeProps({ ...fullForm, essayGrowth: "y".repeat(320) })} />);
    expect(screen.getByDisplayValue("y".repeat(320))).toBeInTheDocument();
    expect(screen.getByText(/320 \/ 3,000/)).toBeInTheDocument();
  });
});

describe("ReferralView (step IV)", () => {
  const View = STEPS[3]!.View;

  it("renders the optional referral field", () => {
    render(<View {...makeProps({ ...emptyForm, referral: "친구의 소개" })} />);
    expect(screen.getByDisplayValue("친구의 소개")).toBeInTheDocument();
  });
});

describe("PreviewView (step V)", () => {
  const View = STEPS[4]!.View;

  it("shows the entered values for review", () => {
    render(<View {...makeProps(fullForm)} />);
    expect(screen.getByText(fullForm.name)).toBeInTheDocument();
    expect(screen.getByText(fullForm.email)).toBeInTheDocument();
    expect(screen.getByText(fullForm.role)).toBeInTheDocument();
    expect(screen.getByText(fullForm.industry)).toBeInTheDocument();
  });

  it("hides the referral row when empty", () => {
    render(<View {...makeProps({ ...fullForm, referral: "" })} />);
    expect(screen.queryByText("연결고리")).toBeNull();
  });

  it("shows the referral row when present", () => {
    render(<View {...makeProps({ ...fullForm, referral: "친구의 소개" })} />);
    expect(screen.getByText("연결고리")).toBeInTheDocument();
    expect(screen.getByText("친구의 소개")).toBeInTheDocument();
  });
});
