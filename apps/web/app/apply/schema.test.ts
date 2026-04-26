import { describe, it, expect } from "vitest";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  fullSchema,
} from "./schema";

const validStep1 = {
  name: "홍길동",
  email: "hong@example.com",
  role: "프로덕트 디자이너",
  industry: "핀테크",
};

describe("step1Schema", () => {
  it("accepts a valid payload and lowercases the email", () => {
    const r = step1Schema.parse({ ...validStep1, email: "Hong@Example.COM" });
    expect(r.email).toBe("hong@example.com");
  });

  it("rejects empty name", () => {
    expect(step1Schema.safeParse({ ...validStep1, name: " " }).success).toBe(false);
  });

  it("rejects malformed email", () => {
    expect(step1Schema.safeParse({ ...validStep1, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects role longer than 80 chars", () => {
    expect(step1Schema.safeParse({ ...validStep1, role: "x".repeat(81) }).success).toBe(false);
  });
});

describe("step2Schema (essayValues)", () => {
  it("requires at least 400 chars", () => {
    expect(step2Schema.safeParse({ essayValues: "x".repeat(399) }).success).toBe(false);
    expect(step2Schema.safeParse({ essayValues: "x".repeat(400) }).success).toBe(true);
  });

  it("rejects more than 3000 chars", () => {
    expect(step2Schema.safeParse({ essayValues: "x".repeat(3001) }).success).toBe(false);
  });
});

describe("step3Schema (essayGrowth)", () => {
  it("requires at least 300 chars", () => {
    expect(step3Schema.safeParse({ essayGrowth: "x".repeat(299) }).success).toBe(false);
    expect(step3Schema.safeParse({ essayGrowth: "x".repeat(300) }).success).toBe(true);
  });
});

describe("step4Schema (referral)", () => {
  it("accepts an empty string (optional)", () => {
    expect(step4Schema.safeParse({ referral: "" }).success).toBe(true);
  });

  it("accepts a referral up to 200 chars", () => {
    expect(step4Schema.safeParse({ referral: "x".repeat(200) }).success).toBe(true);
    expect(step4Schema.safeParse({ referral: "x".repeat(201) }).success).toBe(false);
  });

  it("accepts an undefined referral", () => {
    expect(step4Schema.safeParse({}).success).toBe(true);
  });
});

describe("fullSchema honeypot", () => {
  const valid = {
    ...validStep1,
    essayValues: "x".repeat(500),
    essayGrowth: "y".repeat(400),
    referral: "",
  };

  it("accepts an empty honeypot", () => {
    expect(fullSchema.safeParse({ ...valid, _hp: "" }).success).toBe(true);
  });

  it("accepts an absent honeypot", () => {
    expect(fullSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a populated honeypot", () => {
    expect(fullSchema.safeParse({ ...valid, _hp: "spam" }).success).toBe(false);
  });
});
