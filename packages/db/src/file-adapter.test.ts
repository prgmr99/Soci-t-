import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createFileAdapter } from "./file-adapter";

const SAMPLE = {
  name: "홍길동",
  email: "hong@example.com",
  role: "프로덕트 디자이너",
  industry: "핀테크",
  essayValues: "values".repeat(80),
  essayGrowth: "growth".repeat(60),
};

let dataDir: string;

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "societe-db-"));
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

describe("createFileAdapter.save", () => {
  it("creates the data directory and persists a JSONL row with generated metadata", async () => {
    const adapter = createFileAdapter(dataDir);
    const saved = await adapter.save(SAMPLE);

    expect(saved.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(saved.status).toBe("pending");
    expect(saved.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(saved.serial).toMatch(/^S-\d{4}-000001$/);

    const raw = await fs.readFile(path.join(dataDir, "applications.jsonl"), "utf8");
    expect(raw.trim().split("\n")).toHaveLength(1);
  });

  it("monotonically increments the serial across saves", async () => {
    const adapter = createFileAdapter(dataDir);
    const a = await adapter.save({ ...SAMPLE, email: "a@example.com" });
    const b = await adapter.save({ ...SAMPLE, email: "b@example.com" });
    const c = await adapter.save({ ...SAMPLE, email: "c@example.com" });

    expect(a.serial).toMatch(/000001$/);
    expect(b.serial).toMatch(/000002$/);
    expect(c.serial).toMatch(/000003$/);
  });
});

describe("createFileAdapter.findByEmail", () => {
  it("returns null when the file does not yet exist", async () => {
    const adapter = createFileAdapter(dataDir);
    expect(await adapter.findByEmail("nope@example.com")).toBeNull();
  });

  it("finds an entry by exact lowercase email", async () => {
    const adapter = createFileAdapter(dataDir);
    await adapter.save({ ...SAMPLE, email: "hong@example.com" });
    const hit = await adapter.findByEmail("hong@example.com");
    expect(hit?.email).toBe("hong@example.com");
  });

  it("matches case-insensitively (input is lowercased before compare)", async () => {
    const adapter = createFileAdapter(dataDir);
    await adapter.save({ ...SAMPLE, email: "hong@example.com" });
    const hit = await adapter.findByEmail("HONG@example.com");
    expect(hit?.email).toBe("hong@example.com");
  });
});

describe("createFileAdapter.get", () => {
  it("retrieves the saved row by id", async () => {
    const adapter = createFileAdapter(dataDir);
    const saved = await adapter.save(SAMPLE);
    const got = await adapter.get(saved.id);
    expect(got).toEqual(saved);
  });

  it("returns null for unknown ids", async () => {
    const adapter = createFileAdapter(dataDir);
    expect(await adapter.get("does-not-exist")).toBeNull();
  });
});
