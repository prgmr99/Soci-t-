import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useApplicationDraft } from "./useApplicationDraft";

const KEY = "societe:application:draft:v1";

const SAVED = {
  name: "홍길동",
  email: "hong@example.com",
  role: "디자이너",
  industry: "핀테크",
  essayValues: "v",
  essayGrowth: "g",
  referral: "",
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useApplicationDraft initial state", () => {
  it("starts with an empty form when storage is empty", () => {
    const { result } = renderHook(() => useApplicationDraft());
    expect(result.current.form.name).toBe("");
    expect(result.current.pendingDraft).toBeNull();
  });

  it("surfaces a non-empty saved draft as pendingDraft (form stays empty)", () => {
    localStorage.setItem(KEY, JSON.stringify(SAVED));
    const { result } = renderHook(() => useApplicationDraft());
    expect(result.current.pendingDraft).toEqual(SAVED);
    expect(result.current.form.name).toBe("");
  });

  it("ignores an all-empty saved draft", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        name: "",
        email: "",
        role: "",
        industry: "",
        essayValues: "",
        essayGrowth: "",
        referral: "",
      }),
    );
    const { result } = renderHook(() => useApplicationDraft());
    expect(result.current.pendingDraft).toBeNull();
  });

  it("ignores corrupt JSON in storage", () => {
    localStorage.setItem(KEY, "{not-json");
    const { result } = renderHook(() => useApplicationDraft());
    expect(result.current.pendingDraft).toBeNull();
  });
});

describe("setField + autosave", () => {
  it("updates the form synchronously and writes to storage after idle", () => {
    const { result } = renderHook(() => useApplicationDraft());

    act(() => {
      result.current.setField("name", "홍길동");
    });

    expect(result.current.form.name).toBe("홍길동");
    expect(localStorage.getItem(KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(localStorage.getItem(KEY)).toContain("홍길동");
  });

  it("debounces rapid edits — only the latest value is saved", () => {
    const { result } = renderHook(() => useApplicationDraft());

    act(() => {
      result.current.setField("name", "A");
    });
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    act(() => {
      result.current.setField("name", "AB");
    });
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(localStorage.getItem(KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(localStorage.getItem(KEY)).toContain('"name":"AB"');
  });
});

describe("flushDraft", () => {
  it("writes the current form to storage immediately", () => {
    const { result } = renderHook(() => useApplicationDraft());

    act(() => {
      result.current.setField("email", "x@y.com");
    });
    act(() => {
      result.current.flushDraft();
    });

    expect(localStorage.getItem(KEY)).toContain("x@y.com");
  });
});

describe("resumeDraft", () => {
  it("hydrates the form with the pending draft and clears the prompt", () => {
    localStorage.setItem(KEY, JSON.stringify(SAVED));
    const { result } = renderHook(() => useApplicationDraft());

    act(() => {
      result.current.resumeDraft();
    });

    expect(result.current.form).toEqual(SAVED);
    expect(result.current.pendingDraft).toBeNull();
  });
});

describe("discardDraft", () => {
  it("removes the saved draft and resets the form to empty", () => {
    localStorage.setItem(KEY, JSON.stringify(SAVED));
    const { result } = renderHook(() => useApplicationDraft());

    act(() => {
      result.current.discardDraft();
    });

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(result.current.form.name).toBe("");
    expect(result.current.pendingDraft).toBeNull();
  });
});
