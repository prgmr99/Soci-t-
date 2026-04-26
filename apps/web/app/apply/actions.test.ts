import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures the shared state exists before the hoisted vi.mock factories
// reference it, avoiding the TDZ error you'd get with a top-level `const`.
const { mockAdapter, headerStore } = vi.hoisted(() => ({
  mockAdapter: {
    save: vi.fn(),
    findByEmail: vi.fn(),
    get: vi.fn(),
  },
  headerStore: new Map<string, string>(),
}));

vi.mock("@societe/db", () => ({
  createFileAdapter: () => mockAdapter,
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (k: string) => headerStore.get(k.toLowerCase()) ?? null,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const e = new Error(`NEXT_REDIRECT:${url}`);
    (e as Error & { digest?: string }).digest = `NEXT_REDIRECT:${url}`;
    throw e;
  },
}));

// `cache` from "react" is a Server-Component primitive. In tests we replace it
// with an identity function so the per-request memoisation is a no-op.
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  };
});

import { checkEmailAvailable, submitApplication } from "./actions";

const VALID_FIELDS = {
  name: "홍길동",
  email: "hong@example.com",
  role: "디자이너",
  industry: "핀테크",
  essayValues: "v".repeat(500),
  essayGrowth: "g".repeat(400),
  referral: "",
};

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const merged = { ...VALID_FIELDS, _hp: "", ...overrides };
  Object.entries(merged).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

beforeEach(() => {
  mockAdapter.save.mockReset();
  mockAdapter.findByEmail.mockReset();
  mockAdapter.get.mockReset();
  headerStore.clear();
  headerStore.set("x-forwarded-for", `ip-${Math.random().toString(36).slice(2, 10)}`);
});

describe("checkEmailAvailable", () => {
  it("returns available=true when no row matches", async () => {
    mockAdapter.findByEmail.mockResolvedValue(null);
    const r = await checkEmailAvailable("free@example.com");
    expect(r).toEqual({ available: true });
  });

  it("returns available=false when a row matches", async () => {
    mockAdapter.findByEmail.mockResolvedValue({
      id: "1",
      email: "dup@example.com",
    });
    const r = await checkEmailAvailable("dup@example.com");
    expect(r).toEqual({ available: false });
  });
});

describe("submitApplication", () => {
  it("silently rejects when the honeypot is populated (no validation, no DB call)", async () => {
    const result = await submitApplication(buildFormData({ _hp: "spam" }));
    expect(result).toEqual({ ok: false, error: "" });
    expect(mockAdapter.findByEmail).not.toHaveBeenCalled();
    expect(mockAdapter.save).not.toHaveBeenCalled();
  });

  it("returns a friendly error when validation fails", async () => {
    const result = await submitApplication(
      buildFormData({ email: "not-an-email" }),
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe("입력값을 다시 확인해 주세요.");
    expect(mockAdapter.save).not.toHaveBeenCalled();
  });

  it("returns a duplicate-email error and does not save", async () => {
    mockAdapter.findByEmail.mockResolvedValue({
      id: "x",
      email: "hong@example.com",
    });
    const result = await submitApplication(buildFormData());
    expect(result).toEqual({
      ok: false,
      error: "이미 접수된 이메일입니다.",
    });
    expect(mockAdapter.save).not.toHaveBeenCalled();
  });

  it("rate-limits after 5 successful submissions from the same IP", async () => {
    headerStore.set("x-forwarded-for", "203.0.113.99");
    mockAdapter.findByEmail.mockResolvedValue(null);
    mockAdapter.save.mockResolvedValue({ serial: "S-2026-000001" });

    // 5 successful submissions (each redirects → throws)
    for (let i = 0; i < 5; i++) {
      const fd = buildFormData({ email: `user${i}@example.com` });
      await expect(submitApplication(fd)).rejects.toThrow(/NEXT_REDIRECT/);
    }

    const blocked = await submitApplication(
      buildFormData({ email: "user6@example.com" }),
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toContain("너무 많은 요청");
  });

  it("redirects to /apply/submitted with the issued serial on success", async () => {
    mockAdapter.findByEmail.mockResolvedValue(null);
    mockAdapter.save.mockResolvedValue({ serial: "S-2026-000123" });

    await expect(submitApplication(buildFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/apply/submitted?serial=S-2026-000123",
    );
    expect(mockAdapter.save).toHaveBeenCalledTimes(1);
    const arg = mockAdapter.save.mock.calls[0][0];
    expect(arg.email).toBe("hong@example.com");
    // Honeypot stripped from the persisted payload; referral is preserved
    // verbatim (the action uses `?? undefined`, which keeps "" as "").
    expect(arg).not.toHaveProperty("_hp");
    expect(arg.referral).toBe("");
  });

  it("preserves a non-empty referral on save", async () => {
    mockAdapter.findByEmail.mockResolvedValue(null);
    mockAdapter.save.mockResolvedValue({ serial: "S-2026-000999" });

    await expect(
      submitApplication(buildFormData({ referral: "친구의 소개" })),
    ).rejects.toThrow(/NEXT_REDIRECT/);
    expect(mockAdapter.save.mock.calls[0][0].referral).toBe("친구의 소개");
  });
});
