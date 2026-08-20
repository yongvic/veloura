import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Veloura — Écrin de souhaits",
    short_name: "Veloura",
    description:
      "Wishlist cadeaux intime et raffinée. Ajoutez vos envies, organisez vos occasions et gardez la mémoire des cadeaux offerts.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#2b0b1a",
    theme_color: "#2b0b1a",
    lang: "fr",
    categories: ["lifestyle", "shopping"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
