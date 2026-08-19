import { describe, expect, it } from "vitest";
import {
  canDeleteWish,
  canEditWish,
  canMarkGifted,
  canReserve,
  canUnreserve,
  TRANSITION_ERRORS
} from "@/lib/wish-transitions";
import type { WishStatus } from "@/lib/types";

const statuses: WishStatus[] = ["ACTIVE", "RESERVED", "GIFTED"];

describe("machine à états des envies", () => {
  it("réserver n'est possible que depuis ACTIVE", () => {
    expect(canReserve("ACTIVE")).toBe(true);
    expect(canReserve("RESERVED")).toBe(false);
    expect(canReserve("GIFTED")).toBe(false);
  });

  it("annuler une réservation n'est possible que depuis RESERVED", () => {
    expect(canUnreserve("RESERVED")).toBe(true);
    expect(canUnreserve("ACTIVE")).toBe(false);
    expect(canUnreserve("GIFTED")).toBe(false);
  });

  it("offrir est possible depuis ACTIVE (don spontané) et RESERVED, jamais deux fois", () => {
    expect(canMarkGifted("ACTIVE")).toBe(true);
    expect(canMarkGifted("RESERVED")).toBe(true);
    expect(canMarkGifted("GIFTED")).toBe(false);
  });

  it("GIFTED est terminal : ni suppression ni édition", () => {
    expect(canDeleteWish("GIFTED")).toBe(false);
    expect(canEditWish("GIFTED")).toBe(false);
    expect(canDeleteWish("ACTIVE")).toBe(true);
    expect(canDeleteWish("RESERVED")).toBe(true);
    expect(canEditWish("ACTIVE")).toBe(true);
    expect(canEditWish("RESERVED")).toBe(true);
  });

  it("chaque transition refusée a un message utilisateur", () => {
    for (const _status of statuses) {
      expect(TRANSITION_ERRORS.reserve).toBeTruthy();
      expect(TRANSITION_ERRORS.unreserve).toBeTruthy();
      expect(TRANSITION_ERRORS.gift).toBeTruthy();
      expect(TRANSITION_ERRORS.delete).toBeTruthy();
      expect(TRANSITION_ERRORS.edit).toBeTruthy();
    }
  });
});
