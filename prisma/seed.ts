import { PrismaClient, UserRole, WishPriority, WishStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const recipient = await prisma.user.upsert({
    where: { email: "her@veloura.app" },
    update: {},
    create: {
      email: "her@veloura.app",
      name: "Aimee",
      role: UserRole.RECIPIENT
    }
  });

  const gifter = await prisma.user.upsert({
    where: { email: "you@veloura.app" },
    update: {},
    create: {
      email: "you@veloura.app",
      name: "Mika",
      role: UserRole.GIFTER
    }
  });

  const occasions = await Promise.all(
    [
      ["Anniversaire", "anniversaire", "Son moment phare de l'annee"],
      ["Noel", "noel", "Les cadeaux qui font chaud au coeur"],
      ["Saint-Valentin", "saint-valentin", "Les attentions romantiques"],
      ["Surprise", "surprise", "Sans date speciale, juste pour faire plaisir"]
    ].map(([name, slug, description]) =>
      prisma.occasion.upsert({
        where: { slug },
        update: {},
        create: { name, slug, description }
      })
    )
  );

  await prisma.preferenceProfile.upsert({
    where: { userId: recipient.id },
    update: {},
    create: {
      userId: recipient.id,
      favoriteColors: ["Prune", "Mauve", "Argent"],
      favoriteBrands: ["Sephora", "Zara", "Aldo"],
      favoriteStyles: ["Delicat", "Elegant", "Minimal"],
      sizes: ["38", "M"],
      avoidNotes: ["Eviter les gadgets encombrants", "Pas de parfum trop sucre"]
    }
  });

  const [birthday, christmas, valentine] = occasions;

  await prisma.wish.upsert({
    where: { id: "veloura-active-bag" },
    update: {},
    create: {
      id: "veloura-active-bag",
      title: "Mini sac couleur prune",
      description: "Un modele structure, chic, a porter le soir ou en sortie.",
      category: "Mode",
      priceFcfa: 45000,
      priority: WishPriority.MUST_HAVE,
      status: WishStatus.ACTIVE,
      recipientId: recipient.id,
      occasionId: birthday.id,
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80"
    }
  });

  await prisma.wish.upsert({
    where: { id: "veloura-active-skincare" },
    update: {},
    create: {
      id: "veloura-active-skincare",
      title: "Set skincare glow",
      description: "Routine simple avec textures fines et packaging premium.",
      category: "Beaute",
      priceFcfa: 28000,
      priority: WishPriority.WOULD_LOVE,
      status: WishStatus.RESERVED,
      recipientId: recipient.id,
      occasionId: christmas.id,
      reservedById: gifter.id,
      imageUrl: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80"
    }
  });

  await prisma.wish.upsert({
    where: { id: "veloura-gifted-watch" },
    update: {
      giftedAt: new Date("2026-06-14T12:00:00.000Z")
    },
    create: {
      id: "veloura-gifted-watch",
      title: "Montre doree minimaliste",
      description: "Un cadeau deja offert pour une occasion speciale.",
      category: "Bijoux",
      priceFcfa: 62000,
      priority: WishPriority.LUXURY,
      status: WishStatus.GIFTED,
      recipientId: recipient.id,
      occasionId: valentine.id,
      giftedAt: new Date("2026-06-14T12:00:00.000Z"),
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80"
    }
  });

  await prisma.giftHistory.upsert({
    where: { wishId: "veloura-gifted-watch" },
    update: {},
    create: {
      wishId: "veloura-gifted-watch",
      giftedAt: new Date("2026-06-14T12:00:00.000Z"),
      note: "Offert pendant un diner en tete-a-tete.",
      reaction: "Tres aime"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
