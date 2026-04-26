import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const checkEmailAvailable = vi.fn();
vi.mock("../actions", () => ({
  checkEmailAvailable: (email: string) => checkEmailAvailable(email),
}));

import { useEmailAvailability } from "./useEmailAvailability";

beforeEach(() => {
  checkEmailAvailable.mockReset();
});

// Real timers throughout — the debounce is 600ms, well under the 5s test
// budget, and mixing fake timers with `waitFor`/Suspense flushes routinely
// hangs in jsdom.

describe("useEmailAvailability", () => {
  it("starts idle for empty input", () => {
    const { result } = renderHook(({ email }) => useEmailAvailability(email), {
      initialProps: { email: "" },
    });
    expect(result.current).toBe("idle");
  });

  it("stays idle for syntactically invalid emails", async () => {
    const { result } = renderHook(({ email }) => useEmailAvailability(email), {
      initialProps: { email: "not-an-email" },
    });
    await new Promise((r) => setTimeout(r, 800));
    expect(result.current).toBe("idle");
    expect(checkEmailAvailable).not.toHaveBeenCalled();
  });

  it("debounces and reports 'available' on success", async () => {
    checkEmailAvailable.mockResolvedValue({ available: true });
    const { result } = renderHook(
      ({ email }) => useEmailAvailability(email),
      { initialProps: { email: "hong@example.com" } },
    );

    expect(result.current).toBe("idle");
    await waitFor(() => expect(result.current).toBe("available"), {
      timeout: 2000,
    });
    expect(checkEmailAvailable).toHaveBeenCalledWith("hong@example.com");
  });

  it("reports 'taken' when the action says the email is registered", async () => {
    checkEmailAvailable.mockResolvedValue({ available: false });
    const { result } = renderHook(
      ({ email }) => useEmailAvailability(email),
      { initialProps: { email: "dup@example.com" } },
    );

    await waitFor(() => expect(result.current).toBe("taken"), {
      timeout: 2000,
    });
  });

  it("falls back to idle if the action throws", async () => {
    checkEmailAvailable.mockRejectedValue(new Error("network"));
    const { result } = renderHook(
      ({ email }) => useEmailAvailability(email),
      { initialProps: { email: "boom@example.com" } },
    );

    // Wait past the debounce + microtask flush, then assert it remained idle.
    await new Promise((r) => setTimeout(r, 900));
    expect(result.current).toBe("idle");
    expect(checkEmailAvailable).toHaveBeenCalledWith("boom@example.com");
  });

  it("returns idle while the email differs from the last checked value", async () => {
    checkEmailAvailable.mockResolvedValue({ available: true });
    const { result, rerender } = renderHook(
      ({ email }) => useEmailAvailability(email),
      { initialProps: { email: "a@example.com" } },
    );

    await waitFor(() => expect(result.current).toBe("available"), {
      timeout: 2000,
    });

    rerender({ email: "b@example.com" });
    expect(result.current).toBe("idle");
  });
});
