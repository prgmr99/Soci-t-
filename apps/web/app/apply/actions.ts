"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import path from "node:path";
import { createFileAdapter } from "@societe/db";
import { fullSchema } from "./schema";

// Module-scoped adapter — single JSONL file under apps/web/.data
const adapter = createFileAdapter(path.join(process.cwd(), ".data"));

// ---------------------------------------------------------------------------
// Rate-limiting: in-memory, max 5 submissions per IP per hour
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

async function resolveIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return false; // rate limited
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true; // allowed
}

// ---------------------------------------------------------------------------
// checkEmailAvailable
// ---------------------------------------------------------------------------
export async function checkEmailAvailable(
  email: string
): Promise<{ available: boolean }> {
  const ip = await resolveIp();
  // Lightweight rate-limit check (shared map, no count increment for lookups)
  const existing = await adapter.findByEmail(email);
  console.info({ ts: new Date().toISOString(), ip, action: "checkEmail", ok: true });
  return { available: existing === null };
}

// ---------------------------------------------------------------------------
// submitApplication
// ---------------------------------------------------------------------------
export async function submitApplication(
  formData: FormData
): Promise<{ ok: false; error: string }> {
  const ip = await resolveIp();

  // Rate limit
  if (!checkRateLimit(ip)) {
    console.info({ ts: new Date().toISOString(), ip, action: "submit", ok: false });
    return { ok: false, error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  // Parse form data into plain object
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") raw[key] = value;
  });

  // Honeypot check
  if (raw["_hp"] && raw["_hp"].length > 0) {
    // Silently reject
    console.info({ ts: new Date().toISOString(), ip, action: "submit", ok: false });
    return { ok: false, error: "" };
  }

  // Zod validation
  const parsed = fullSchema.safeParse(raw);
  if (!parsed.success) {
    console.info({ ts: new Date().toISOString(), ip, action: "submit", ok: false });
    return {
      ok: false,
      error: "입력값을 다시 확인해 주세요.",
    };
  }

  const data = parsed.data;

  // Email uniqueness
  const existing = await adapter.findByEmail(data.email);
  if (existing) {
    console.info({ ts: new Date().toISOString(), ip, action: "submit", ok: false });
    return { ok: false, error: "이미 접수된 이메일입니다." };
  }

  // Persist
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _hp, referral, ...coreFields } = data;
  const application = await adapter.save({
    ...coreFields,
    referral: referral ?? undefined,
  });

  console.info({ ts: new Date().toISOString(), ip, action: "submit", ok: true });

  // Redirect to submitted page — this throws internally (Next.js redirect)
  redirect(`/apply/submitted?serial=${application.serial}`);
}
