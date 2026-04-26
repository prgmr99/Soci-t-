import { test, expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_FILE = path.resolve(
  process.cwd(),
  "apps/web/.data/applications.jsonl",
);

test.afterAll(async () => {
  // Best-effort cleanup so the dev .data dir doesn't accumulate test rows.
  await fs.rm(DATA_FILE, { force: true });
});

test("five-step apply wizard submits and redirects with a serial", async ({
  page,
}) => {
  const unique = Date.now().toString(36);
  const email = `e2e-${unique}@example.com`;

  await page.goto("/apply");

  // ── Step I: 기본 정보 ────────────────────────────────────────────────────
  await page.getByLabel("이름").fill("Playwright 테스터");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("현재 역할").fill("QA Engineer");
  await page.getByLabel("산업").fill("핀테크");
  await page.getByRole("button", { name: "다음" }).click();

  // ── Step II: 에세이 I ────────────────────────────────────────────────────
  await page.getByRole("textbox").fill("v".repeat(500));
  await page.getByRole("button", { name: "다음" }).click();

  // ── Step III: 에세이 II ──────────────────────────────────────────────────
  await page.getByRole("textbox").fill("g".repeat(400));
  await page.getByRole("button", { name: "다음" }).click();

  // ── Step IV: 연결고리 (optional) ─────────────────────────────────────────
  await page.getByRole("button", { name: "다음" }).click();

  // ── Step V: Preview & submit ─────────────────────────────────────────────
  await expect(page.getByText("제출 확인")).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole("button", { name: "제출하기" }).click();

  await page.waitForURL(/\/apply\/submitted\?serial=S-\d{4}-\d{6}/);
  expect(page.url()).toMatch(/\/apply\/submitted\?serial=S-\d{4}-\d{6}/);
});
