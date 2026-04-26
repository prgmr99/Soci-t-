import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "./StepIndicator";

const LABELS = ["I", "II", "III", "IV", "V"] as const;

describe("StepIndicator", () => {
  it("renders one element per label", () => {
    render(<StepIndicator activeIndex={0} labels={LABELS} />);
    LABELS.forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
  });

  it("marks the active label with the brass-strong token and bold weight", () => {
    render(<StepIndicator activeIndex={2} labels={LABELS} />);
    const active = screen.getByText("III");
    expect(active.className).toContain("text-brass-strong");
    expect(active.className).toContain("font-semibold");
  });

  it("marks completed labels with text-ink", () => {
    render(<StepIndicator activeIndex={3} labels={LABELS} />);
    expect(screen.getByText("I").className).toContain("text-ink");
    expect(screen.getByText("II").className).toContain("text-ink");
  });

  it("marks upcoming labels with text-subtle", () => {
    render(<StepIndicator activeIndex={1} labels={LABELS} />);
    expect(screen.getByText("V").className).toContain("text-subtle");
  });

  it("does not render a separator after the last label", () => {
    const { container } = render(
      <StepIndicator activeIndex={0} labels={LABELS} />,
    );
    // separators are rendered as a "·" span — count should equal labels.length - 1
    const separators = Array.from(container.querySelectorAll("span")).filter(
      (s) => s.textContent === "·",
    );
    expect(separators).toHaveLength(LABELS.length - 1);
  });
});
