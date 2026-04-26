import { describe, it, expect } from "vitest";
import { renderEmail } from "./render";

describe("renderEmail — welcome-approved", () => {
  it("renders the approval email with serial, name, and CTA", async () => {
    const result = await renderEmail({
      name: "welcome-approved",
      props: {
        name: "홍길동",
        serial: "S-2026-000123",
        paymentUrl: "https://example.com/pay/abc",
      },
    });

    expect(result.subject).toBe("Société 입회 허가 · S-2026-000123");
    expect(result.html).toContain("홍길동");
    expect(result.html).toContain("S-2026-000123");
    expect(result.html).toContain("https://example.com/pay/abc");
    expect(result.html).toMatch(/<html|<!DOCTYPE/i);

    expect(result.text).toContain("홍길동");
    expect(result.text).toContain("S-2026-000123");
    expect(result.text).not.toMatch(/<html/i);
  });
});

describe("renderEmail — waitlist-received", () => {
  it("renders the waitlist email with serial, name, and ticket URL", async () => {
    const result = await renderEmail({
      name: "waitlist-received",
      props: {
        name: "김민수",
        serial: "S-2026-000456",
        ticketUrl: "https://example.com/ticket/xyz",
      },
    });

    expect(result.subject).toBe("Société · 지원서 접수 확인");
    expect(result.html).toContain("김민수");
    expect(result.html).toContain("S-2026-000456");
    expect(result.html).toContain("https://example.com/ticket/xyz");

    expect(result.text).toContain("김민수");
    expect(result.text).toContain("S-2026-000456");
  });
});
