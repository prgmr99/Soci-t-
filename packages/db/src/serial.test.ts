import { describe, it, expect } from "vitest";
import { generateSerial } from "./serial";

describe("generateSerial", () => {
  it("formats the serial as S-YYYY-NNNNNN with the current UTC year", () => {
    const year = new Date().getUTCFullYear();
    expect(generateSerial(1)).toBe(`S-${year}-000001`);
  });

  it("zero-pads the index to six digits", () => {
    const year = new Date().getUTCFullYear();
    expect(generateSerial(42)).toBe(`S-${year}-000042`);
    expect(generateSerial(123_456)).toBe(`S-${year}-123456`);
  });

  it("does not truncate seven-digit indices", () => {
    const year = new Date().getUTCFullYear();
    expect(generateSerial(1_000_000)).toBe(`S-${year}-1000000`);
  });
});
