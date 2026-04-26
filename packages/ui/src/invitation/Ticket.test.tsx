import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Ticket } from "./Ticket";

describe("Ticket", () => {
  const baseProps = {
    issuedAt: "2026-04-23T10:00:00.000Z",
    serial: "S-2026-000123",
  };

  it("renders the pending variant with korean date and serial", () => {
    render(<Ticket {...baseProps} status="pending" />);
    expect(screen.getByText(/2026년 4월 23일/)).toBeInTheDocument();
    // header label and title
    expect(screen.getByText(/SOCIÉTÉ · WAITLIST TICKET/)).toBeInTheDocument();
    expect(screen.getByText("인비테이션 대기권")).toBeInTheDocument();
    expect(screen.getByText(/STATUS · PENDING/)).toBeInTheDocument();
    expect(screen.getByText(`N° ${baseProps.serial}`)).toBeInTheDocument();
  });

  it("renders the approved variant with name and approved label", () => {
    render(<Ticket {...baseProps} status="approved" name="홍길동" />);
    expect(screen.getByText(/SOCIÉTÉ · APPROVED TICKET/)).toBeInTheDocument();
    expect(screen.getByText("입회 허가증")).toBeInTheDocument();
    expect(screen.getByText(/STATUS · APPROVED/)).toBeInTheDocument();
    expect(screen.getByText("홍길동")).toBeInTheDocument();
  });

  it("uses the serial when no name is given", () => {
    render(<Ticket {...baseProps} status="approved" />);
    expect(screen.getByText(`N° ${baseProps.serial}`)).toBeInTheDocument();
  });

  it("exposes an accessible label that includes the serial", () => {
    const { container } = render(<Ticket {...baseProps} status="approved" />);
    const root = container.querySelector("[role='img']");
    expect(root?.getAttribute("aria-label")).toContain("S-2026-000123");
  });

  it("emits a deterministic barcode (same serial → same widths)", () => {
    const { container: a } = render(
      <Ticket {...baseProps} serial="S-2026-000777" status="pending" />,
    );
    const { container: b } = render(
      <Ticket {...baseProps} serial="S-2026-000777" status="pending" />,
    );
    const widths = (c: HTMLElement) =>
      Array.from(c.querySelectorAll("rect")).map((r) => r.getAttribute("width"));
    expect(widths(a)).toEqual(widths(b));
    expect(widths(a).length).toBeGreaterThan(0);
  });

  it("formats single-digit months/days without zero padding", () => {
    render(
      <Ticket
        status="pending"
        issuedAt="2026-01-05T00:00:00.000Z"
        serial="S-2026-000001"
      />,
    );
    expect(screen.getByText(/2026년 1월 5일/)).toBeInTheDocument();
  });
});
