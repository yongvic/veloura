import { describe, expect, it } from "vitest";
import {
  MAX_PRICE_FCFA,
  parseCategory,
  parsePriceFcfa,
  parseProductUrl,
  parseTagList,
  parseWishPriority,
  slugify
} from "@/lib/validation";

describe("parseProductUrl", () => {
  it("accepte les URLs http(s) absolues", () => {
    expect(parseProductUrl("https://www.zara.com/fr/sac")).toEqual({
      url: "https://www.zara.com/fr/sac"
    });
    expect(parseProductUrl("http://shop.sn/article")).toEqual({
      url: "http://shop.sn/article"
    });
  });

  it("rejette les schémas dangereux", () => {
    expect(parseProductUrl("javascript:alert(1)")).toHaveProperty("error");
    expect(parseProductUrl("data:text/html,<script>")).toHaveProperty("error");
    expect(parseProductUrl("file:///etc/passwd")).toHaveProperty("error");
  });

  it("rejette les URLs invalides ou relatives", () => {
    expect(parseProductUrl("pas une url")).toHaveProperty("error");
    expect(parseProductUrl("/relative/path")).toHaveProperty("error");
    expect(parseProductUrl("www.sans-schema.com")).toHaveProperty("error");
  });

  it("vide = pas de lien", () => {
    expect(parseProductUrl("")).toEqual({ url: null });
    expect(parseProductUrl("   ")).toEqual({ url: null });
    expect(parseProductUrl(null)).toEqual({ url: null });
  });
});

describe("parsePriceFcfa", () => {
  it("accepte les entiers positifs", () => {
    expect(parsePriceFcfa("25000")).toEqual({ price: 25000 });
    expect(parsePriceFcfa("0")).toEqual({ price: 0 });
  });

  it("rejette décimaux, négatifs et montants absurdes", () => {
    expect(parsePriceFcfa("99.99")).toHaveProperty("error");
    expect(parsePriceFcfa("-50")).toHaveProperty("error");
    expect(parsePriceFcfa(String(MAX_PRICE_FCFA + 1))).toHaveProperty("error");
    expect(parsePriceFcfa("abc")).toHaveProperty("error");
  });

  it("vide = pas de prix", () => {
    expect(parsePriceFcfa("")).toEqual({ price: null });
  });
});

describe("parseWishPriority / parseCategory", () => {
  it("valeurs inconnues → valeurs sûres par défaut", () => {
    expect(parseWishPriority("MUST_HAVE")).toBe("MUST_HAVE");
    expect(parseWishPriority("GOD_MODE")).toBe("WOULD_LOVE");
    expect(parseWishPriority("")).toBe("WOULD_LOVE");
    expect(parseCategory("Bijoux")).toBe("Bijoux");
    expect(parseCategory("Autre")).toBe("Autre");
    expect(parseCategory("quelque chose d'inventé")).toBe("Autre");
  });
});

describe("parseTagList", () => {
  it("découpe virgules et retours à la ligne, nettoie et borne", () => {
    expect(parseTagList("38, 39\nBague 52,, ")).toEqual(["38", "39", "Bague 52"]);
    expect(parseTagList(`${Array.from({ length: 30 }, (_, i) => `item${i}`).join(",")}`))
      .toHaveLength(20);
    expect(parseTagList("x".repeat(200))[0]).toHaveLength(80);
    expect(parseTagList("")).toEqual([]);
  });
});

describe("slugify", () => {
  it("produit des slugs stables et sûrs", () => {
    expect(slugify("Fête des Mères")).toBe("fete-des-meres");
    expect(slugify("  Noël 2026 !! ")).toBe("noel-2026");
    expect(slugify("Crémaillère Été")).toBe("cremaillere-ete");
  });

  it("renvoie vide si rien d'exploitable", () => {
    expect(slugify("###")).toBe("");
  });
});
