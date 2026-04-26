import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SectionFrame } from "./SectionFrame";

describe("SectionFrame", () => {
  it("renders a <section> by default", () => {
    const { container } = render(
      <SectionFrame>
        <p>child</p>
      </SectionFrame>,
    );
    expect(container.querySelector("section")).toBeTruthy();
  });

  it("supports the 'as' override and id", () => {
    const { container } = render(
      <SectionFrame as="article" id="manifesto">
        x
      </SectionFrame>,
    );
    const article = container.querySelector("article");
    expect(article).toBeTruthy();
    expect(article).toHaveAttribute("id", "manifesto");
  });

  it("applies tone classes", () => {
    const { container: paper } = render(<SectionFrame tone="paper">x</SectionFrame>);
    expect(paper.firstElementChild?.className).toContain("bg-paper");

    const { container: ink } = render(<SectionFrame tone="ink">x</SectionFrame>);
    expect(ink.firstElementChild?.className).toContain("bg-ink");

    const { container: soft } = render(<SectionFrame tone="paper-soft">x</SectionFrame>);
    expect(soft.firstElementChild?.className).toContain("bg-paper-soft");
  });

  it("wraps children in a max-width container", () => {
    const { container } = render(
      <SectionFrame>
        <p data-testid="child">hi</p>
      </SectionFrame>,
    );
    const wrapper = container.querySelector("[class*='max-w-']");
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector("[data-testid='child']")).toBeTruthy();
  });
});
