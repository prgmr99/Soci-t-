"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import path from "node:path";
import { createFileAdapter } from "@societe/db";
import { fullSchema } from "./schema";

// Module-scoped adapter — single JSONL file under apps/web/.data.
// Hoisted so we don't pay the constructor cost on every request.
const adapter = createFileAdapter(path.join(process.cwd(), ".data"));

/**
 * Per-request memoised email lookup.
 *
 * Why: `checkEmailAvailable` and `submitApplication` (when called in the same
 * RSC pass) both probe the same email. `cache()` dedupes within a request so
 * we read the JSONL file once instead of twice.
 */
const findByEmailCached = cache((email: string) => adapter.findByEmail(email));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// In-memory, per-IP, sliding window. Acceptable for a single-instance MVP;
// behind a multi-region deploy this should move to Vercel KV / Redis.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 10_000; // hard cap to prevent unbounded growth

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // Opportunistic eviction: when over cap, drop the oldest entries.
  // Map preserves insertion order so this acts as a coarse LRU.
  if (rateLimitMap.size > RATE_LIMIT_MAX_KEYS) {
    const overflow = rateLimitMap.size - RATE_LIMIT_MAX_KEYS;
    const iter = rateLimitMap.keys();
    for (let i = 0; i < overflow; i++) {
      const k = iter.next().value;
      if (k !== undefined) rateLimitMap.delete(k);
    }
  }

  return true;
}

async function resolveIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

function logEvent(ip: string, action: string, ok: boolean) {
  console.info({ ts: new Date().toISOString(), ip, action, ok });
}

// ─── checkEmailAvailable ──────────────────────────────────────────────────────
export async function checkEmailAvailable(
  email: string
): Promise<{ available: boolean }> {
  const existing = await findByEmailCached(email);
  // IP captured for log parity with submit; resolved last so we don't gate the
  // (cheap) lookup on header parsing.
  const ip = await resolveIp();
  logEvent(ip, "checkEmail", true);
  return { available: existing === null };
}

// ─── submitApplication ────────────────────────────────────────────────────────
export async function submitApplication(
  formData: FormData
): Promise<{ ok: false; error: string }> {
  // 1. Honeypot — sync check, before any I/O. Bots that auto-fill all fields
  //    populate `_hp`; legitimate submissions never touch it. Silent reject.
  const honeypot = formData.get("_hp");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { ok: false, error: "" };
  }

  // 2. Schema validation — also sync. Failing here means we never bother
  //    awaiting headers / disk for malformed payloads.
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") raw[key] = value;
  });
  const parsed = fullSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "입력값을 다시 확인해 주세요." };
  }
  const data = parsed.data;

  // 3. Now we need IP-bound state — pay the await.
  const ip = await resolveIp();

  if (!checkRateLimit(ip)) {
    logEvent(ip, "submit", false);
    return {
      ok: false,
      error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // 4. Email uniqueness — uses the request-scoped cache.
  const existing = await findByEmailCached(data.email);
  if (existing) {
    logEvent(ip, "submit", false);
    return { ok: false, error: "이미 접수된 이메일입니다." };
  }

  // 5. Persist.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _hp, referral, ...coreFields } = data;
  const application = await adapter.save({
    ...coreFields,
    referral: referral ?? undefined,
  });

  logEvent(ip, "submit", true);

  // Next.js `redirect` throws a special error — execution ends here.
  redirect(`/apply/submitted?serial=${application.serial}`);
}
