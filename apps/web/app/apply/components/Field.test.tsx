import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "./Field";

describe("Field.Text", () => {
  it("renders the label and value", () => {
    render(<Field.Text label="이름" value="홍길동" onChange={() => {}} />);
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByDisplayValue("홍길동")).toBeInTheDocument();
  });

  it("invokes onChange with the unwrapped string", async () => {
    const onChange = vi.fn();
    render(<Field.Text value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "ab");
    // userEvent fires per character
    expect(onChange).toHaveBeenLastCalledWith("b");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("invokes onSubmit on Enter and prevents default", async () => {
    const onSubmit = vi.fn();
    render(<Field.Text value="" onChange={() => {}} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole("textbox"), "{enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("invokes onBlur when focus leaves the input", async () => {
    const onBlur = vi.fn();
    render(<Field.Text value="x" onChange={() => {}} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");
    input.focus();
    input.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("respects type=email and maxLength", () => {
    render(
      <Field.Text type="email" maxLength={50} value="" onChange={() => {}} />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("maxlength", "50");
  });

  it("renders a hint slot below the input", () => {
    render(
      <Field.Text
        value=""
        onChange={() => {}}
        hint={<p data-testid="hint">사용 가능한 이메일</p>}
      />,
    );
    expect(screen.getByTestId("hint")).toBeInTheDocument();
  });
});

describe("Field.Textarea", () => {
  it("renders with the supplied value and maxLength", () => {
    render(<Field.Textarea value="hello" onChange={() => {}} maxLength={3000} />);
    const ta = screen.getByDisplayValue("hello") as HTMLTextAreaElement;
    expect(ta.tagName).toBe("TEXTAREA");
    expect(ta).toHaveAttribute("maxlength", "3000");
  });

  it("emits string value on change", async () => {
    const onChange = vi.fn();
    render(<Field.Textarea value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "x");
    expect(onChange).toHaveBeenLastCalledWith("x");
  });

  it("invokes onBlur when focus leaves", () => {
    const onBlur = vi.fn();
    render(<Field.Textarea value="" onChange={() => {}} onBlur={onBlur} />);
    const ta = screen.getByRole("textbox");
    (ta as HTMLTextAreaElement).focus();
    (ta as HTMLTextAreaElement).blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("Field.Counter", () => {
  it("renders 'current / max' with locale separator", () => {
    render(<Field.Counter current={1234} min={400} max={3000} />);
    expect(screen.getByText(/1,234 \/ 3,000/)).toBeInTheDocument();
  });

  it("appends the 'minimum' hint when below min", () => {
    render(<Field.Counter current={50} min={400} max={3000} />);
    expect(screen.getByText(/최소 400자/)).toBeInTheDocument();
  });

  it("hides the minimum hint once min is reached", () => {
    render(<Field.Counter current={400} min={400} max={3000} />);
    expect(screen.queryByText(/최소/)).toBeNull();
  });

  it("switches color tokens once min is reached", () => {
    const { container, rerender } = render(
      <Field.Counter current={399} min={400} max={3000} />,
    );
    expect(container.firstElementChild?.className).toContain("text-subtle");
    rerender(<Field.Counter current={400} min={400} max={3000} />);
    expect(container.firstElementChild?.className).toContain("text-brass-strong");
  });
});
