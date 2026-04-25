"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Application form draft state.
 *
 * Why a single shape (not field-by-field hooks):
 * - Draft persistence is an all-or-nothing concern: we save the whole form
 *   to localStorage on idle, not individual fields. Fragmenting state would
 *   force the autosave layer to subscribe to N stores.
 * - Mirrors how the server action consumes the FormData on submit.
 */
export type ApplicationFormState = {
  name: string;
  email: string;
  role: string;
  industry: string;
  essayValues: string;
  essayGrowth: string;
  referral: string;
};

export type ApplicationField = keyof ApplicationFormState;

const EMPTY: ApplicationFormState = {
  name: "",
  email: "",
  role: "",
  industry: "",
  essayValues: "",
  essayGrowth: "",
  referral: "",
};

const DRAFT_KEY = "societe:application:draft:v1";
const AUTOSAVE_IDLE_MS = 3_000;

// ─── Storage primitives ──────────────────────────────────────────────────────
// Pure functions. localStorage access is wrapped because Safari Private Mode
// can throw on `setItem`, and we'd rather lose the draft than crash the form.

function readDraft(): ApplicationFormState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationFormState;
  } catch {
    return null;
  }
}

function writeDraft(state: ApplicationFormState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    /* swallow — see note above */
  }
}

function deleteDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* swallow */
  }
}

function isEmpty(state: ApplicationFormState): boolean {
  return Object.values(state).every((v) => v === "");
}

// ─── Init helper ─────────────────────────────────────────────────────────────
// SSR-safe: returns `{ pending: null }` on the server, real draft on the
// client. Used as a `useState` lazy initialiser so it runs exactly once.

function initFromStorage(): { pending: ApplicationFormState | null } {
  const saved = readDraft();
  if (saved && !isEmpty(saved)) return { pending: saved };
  return { pending: null };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Single-source-of-truth hook for the application draft.
 *
 * Why this shape:
 * - `form` + `setField` mirrors the controlled-input idiom (close to useState).
 * - `pendingDraft` is null unless there's a previous saved draft worth
 *   surfacing — the consumer renders a banner declaratively from this fact,
 *   not from a separate "showBanner" boolean.
 * - `resumeDraft` / `discardDraft` are the only two actions on that banner,
 *   so we expose them directly instead of leaking the storage API.
 */
export function useApplicationDraft() {
  const [form, setForm] = useState<ApplicationFormState>(EMPTY);
  const [{ pending }, setPending] = useState(initFromStorage);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setField = useCallback(
    <K extends ApplicationField>(field: K, value: ApplicationFormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(
          () => writeDraft(next),
          AUTOSAVE_IDLE_MS
        );
        return next;
      });
    },
    []
  );

  const flushDraft = useCallback(() => {
    setForm((current) => {
      writeDraft(current);
      return current;
    });
  }, []);

  const resumeDraft = useCallback(() => {
    if (!pending) return;
    setForm(pending);
    setPending({ pending: null });
  }, [pending]);

  const discardDraft = useCallback(() => {
    deleteDraft();
    setForm(EMPTY);
    setPending({ pending: null });
  }, []);

  return {
    form,
    setField,
    flushDraft,
    pendingDraft: pending,
    resumeDraft,
    discardDraft,
  };
}
