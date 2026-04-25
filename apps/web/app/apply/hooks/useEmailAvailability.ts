"use client";

import { useEffect, useState } from "react";
import { step1Schema } from "../schema";
import { checkEmailAvailable } from "../actions";

export type EmailAvailability = "idle" | "checking" | "available" | "taken";

const DEBOUNCE_MS = 600;

/**
 * Declarative email-availability check.
 *
 * Why declarative (not "call a function on change"):
 * - The consumer just passes the current email value and gets back the
 *   status. The hook owns debouncing + validation + cancellation, so the
 *   form component stays free of timing logic.
 * - Returning a single union (`"idle" | "checking" | ...`) lets the UI
 *   render a switch instead of juggling boolean flags.
 *
 * Why state is `(checkedFor, status)` and idle is *derived*:
 * - Resetting to "idle" on every keystroke would mean a synchronous
 *   `setState` inside the effect body — React 19 flags that as a
 *   cascading render. Instead we record the email each result was
 *   computed for, and treat any mismatch as implicitly idle.
 */
export function useEmailAvailability(email: string): EmailAvailability {
  const [{ checkedFor, status }, setState] = useState<{
    checkedFor: string;
    status: EmailAvailability;
  }>({ checkedFor: "", status: "idle" });

  useEffect(() => {
    const trimmed = email.trim();
    if (trimmed === "") return;

    const valid = step1Schema.shape.email.safeParse(trimmed);
    if (!valid.success) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setState({ checkedFor: trimmed, status: "checking" });
      try {
        const res = await checkEmailAvailable(trimmed);
        if (cancelled) return;
        setState({
          checkedFor: trimmed,
          status: res.available ? "available" : "taken",
        });
      } catch {
        if (!cancelled) setState({ checkedFor: trimmed, status: "idle" });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  // Derived: a status from a previous email shows as idle until the
  // debounced check catches up.
  return email.trim() === checkedFor ? status : "idle";
}
