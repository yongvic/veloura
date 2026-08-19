import { describe, expect, it } from "vitest";
import { complementaryRole, hashPassword, isAppRole, verifyPassword } from "@/lib/auth";

describe("hashPassword / verifyPassword", () => {
  it("vérifie un mot de passe correct et rejette un mauvais", async () => {
    const stored = await hashPassword("mot-de-passe-solide");
    expect(stored).toContain(":");
    expect(await verifyPassword("mot-de-passe-solide", stored)).toBe(true);
    expect(await verifyPassword("mauvais", stored)).toBe(false);
  });

  it("produit des hashes uniques (sel aléatoire)", async () => {
    const a = await hashPassword("identique");
    const b = await hashPassword("identique");
    expect(a).not.toBe(b);
  });

  it("rejette un format de hash corrompu sans lever d'exception", async () => {
    expect(await verifyPassword("x", "pas-de-sel")).toBe(false);
    expect(await verifyPassword("x", ":")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });
});

describe("complementaryRole / isAppRole", () => {
  it("complémente les rôles de couple, jamais ADMIN", () => {
    expect(complementaryRole("RECIPIENT")).toBe("GIFTER");
    expect(complementaryRole("GIFTER")).toBe("RECIPIENT");
    expect(complementaryRole("ADMIN")).toBe("GIFTER");
  });

  it("isAppRole exclut ADMIN des rôles applicatifs", () => {
    expect(isAppRole("RECIPIENT")).toBe(true);
    expect(isAppRole("GIFTER")).toBe(true);
    expect(isAppRole("ADMIN")).toBe(false);
  });
});
