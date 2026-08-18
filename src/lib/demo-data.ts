import type { DashboardData } from "@/lib/types";

export const demoData: DashboardData = {
  demoMode: true,
  recipientName: "Aimee",
  activeWishes: [
    {
      id: "demo-1",
      title: "Mini sac prune structure",
      description: "Une piece elegante pour les sorties et les dîners.",
      category: "Mode",
      priceFcfa: 45000,
      imageUrl:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      productUrl: null,
      priority: "MUST_HAVE",
      status: "ACTIVE",
      createdAt: new Date("2026-08-08T11:00:00.000Z"),
      giftedAt: null,
      reservedByName: null,
      occasion: {
        id: "occasion-1",
        name: "Anniversaire",
        slug: "anniversaire"
      },
      giftHistory: null
    },
    {
      id: "demo-2",
      title: "Bougie parfumee design",
      description: "Une senteur chic pour la chambre ou le salon.",
      category: "Maison",
      priceFcfa: 12000,
      imageUrl:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
      productUrl: null,
      priority: "WOULD_LOVE",
      status: "ACTIVE",
      createdAt: new Date("2026-08-10T15:30:00.000Z"),
      giftedAt: null,
      reservedByName: null,
      occasion: {
        id: "occasion-2",
        name: "Surprise",
        slug: "surprise"
      },
      giftHistory: null
    }
  ],
  reservedWishes: [
    {
      id: "demo-3",
      title: "Set skincare glow",
      description: "Routine premium minimaliste, textures fines.",
      category: "Beaute",
      priceFcfa: 28000,
      imageUrl:
        "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80",
      productUrl: null,
      priority: "WOULD_LOVE",
      status: "RESERVED",
      createdAt: new Date("2026-08-11T12:00:00.000Z"),
      giftedAt: null,
      reservedByName: "Mika",
      occasion: {
        id: "occasion-3",
        name: "Noel",
        slug: "noel"
      },
      giftHistory: null
    }
  ],
  giftedWishes: [
    {
      id: "demo-4",
      title: "Montre doree minimaliste",
      description: "Une montre deja offerte pour une occasion speciale.",
      category: "Bijoux",
      priceFcfa: 62000,
      imageUrl:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
      productUrl: null,
      priority: "LUXURY",
      status: "GIFTED",
      createdAt: new Date("2026-02-14T18:00:00.000Z"),
      giftedAt: new Date("2026-06-14T12:00:00.000Z"),
      reservedByName: null,
      occasion: {
        id: "occasion-4",
        name: "Saint-Valentin",
        slug: "saint-valentin"
      },
      giftHistory: {
        giftedAt: new Date("2026-06-14T12:00:00.000Z"),
        note: "Offert pendant un diner en tete-a-tete.",
        reaction: "Tres aime"
      }
    }
  ],
  occasions: [
    {
      id: "occasion-1",
      name: "Anniversaire",
      slug: "anniversaire",
      description: "Son moment phare de l'annee",
      eventDate: new Date("2026-11-18T00:00:00.000Z"),
      wishCount: 1
    },
    {
      id: "occasion-3",
      name: "Noel",
      slug: "noel",
      description: "Les cadeaux qui font chaud au coeur",
      eventDate: new Date("2026-12-25T00:00:00.000Z"),
      wishCount: 1
    },
    {
      id: "occasion-2",
      name: "Surprise",
      slug: "surprise",
      description: "Sans date speciale, juste pour faire plaisir",
      eventDate: null,
      wishCount: 1
    }
  ],
  preferences: {
    favoriteColors: ["Prune", "Mauve", "Argent"],
    favoriteBrands: ["Zara", "Sephora", "Aldo"],
    favoriteStyles: ["Elegant", "Minimal", "Delicat"],
    sizes: ["38", "M"],
    avoidNotes: ["Pas de gadget encombrant", "Eviter les parfums trop sucres"]
  }
};
