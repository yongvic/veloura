import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("autorise sous la limite, bloque au-delà, puis relâche après la fenêtre", () => {
    const key = `test:${Math.random()}`;
    const start = 1_000_000;

    for (let i = 0; i < 3; i++) {
      expect(
        checkRateLimit({ key, limit: 3, windowMs: 60_000, now: start }).allowed
      ).toBe(true);
    }

    const blocked = checkRateLimit({ key, limit: 3, windowMs: 60_000, now: start });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    const after = checkRateLimit({
      key,
      limit: 3,
      windowMs: 60_000,
      now: start + 61_000
    });
    expect(after.allowed).toBe(true);
  });

  it("isole les clés entre elles", () => {
    const now = 5_000_000;
    const keyA = `a:${Math.random()}`;
    const keyB = `b:${Math.random()}`;

    checkRateLimit({ key: keyA, limit: 1, windowMs: 60_000, now });
    expect(checkRateLimit({ key: keyA, limit: 1, windowMs: 60_000, now }).allowed).toBe(false);
    expect(checkRateLimit({ key: keyB, limit: 1, windowMs: 60_000, now }).allowed).toBe(true);
  });
});
