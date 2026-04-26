import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Typo } from "./Typo";

describe("Typo.Display", () => {
  it("renders an <h1> by default", () => {
    const { container } = render(<Typo.Display>제목</Typo.Display>);
    expect(container.querySelector("h1")?.textContent).toBe("제목");
  });

  it("renders the polymorphic 'as' tag", () => {
    const { container } = render(<Typo.Display as="h2">제목</Typo.Display>);
    expect(container.querySelector("h2")).toBeTruthy();
    expect(container.querySelector("h1")).toBeFalsy();
  });

  it("merges className", () => {
    const { container } = render(
      <Typo.Display className="extra">x</Typo.Display>,
    );
    expect(container.firstElementChild?.className).toContain("extra");
    expect(container.firstElementChild?.className).toContain("font-serif");
  });
});

describe("Typo.Title", () => {
  it("renders an <h2> by default", () => {
    const { container } = render(<Typo.Title>중제목</Typo.Title>);
    expect(container.querySelector("h2")).toBeTruthy();
  });
});

describe("Typo.Body", () => {
  it("renders a <p> by default", () => {
    const { container } = render(<Typo.Body>본문</Typo.Body>);
    expect(container.querySelector("p")?.textContent).toBe("본문");
  });
});

describe("Typo.Meta", () => {
  it("renders a <span> by default", () => {
    const { container } = render(<Typo.Meta>메타</Typo.Meta>);
    expect(container.querySelector("span")?.textContent).toBe("메타");
  });

  it("supports the 'as' override", () => {
    const { container } = render(<Typo.Meta as="p">메타</Typo.Meta>);
    expect(container.querySelector("p")?.textContent).toBe("메타");
  });
});

describe("Typo.Quote", () => {
  it("renders a <blockquote> by default", () => {
    const { container } = render(<Typo.Quote>인용</Typo.Quote>);
    expect(container.querySelector("blockquote")?.textContent).toBe("인용");
  });
});
