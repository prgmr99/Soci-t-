import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders as a <button> with type=button by default", () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("renders as an <a> when href is provided", () => {
    render(<Button href="/apply">Apply</Button>);
    const link = screen.getByRole("link", { name: "Apply" });
    expect(link).toHaveAttribute("href", "/apply");
  });

  it("supports submit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("disables and applies disabled styles", () => {
    render(<Button disabled>Off</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:opacity-40");
  });

  it("invokes onClick on user click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hit</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom className", () => {
    render(<Button className="extra-class">X</Button>);
    expect(screen.getByRole("button").className).toContain("extra-class");
  });

  it("applies the lg size token when size='lg'", () => {
    render(<Button size="lg">Big</Button>);
    expect(screen.getByRole("button").className).toContain("min-h-14");
  });

  it("applies ghost variant tokens", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button").className).toContain("border-brass");
  });
});
