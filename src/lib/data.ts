import { prisma } from "@/lib/prisma";
import { demoData } from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import type { DashboardData, OccasionSummary, PreferenceSummary, WishSummary } from "@/lib/types";

function mapWish(wish: {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priceFcfa: number | null;
  imageUrl: string | null;
  productUrl: string | null;
  priority: "MUST_HAVE" | "WOULD_LOVE" | "MAYBE_LATER" | "LUXURY";
  status: "ACTIVE" | "RESERVED" | "GIFTED";
  createdAt: Date;
  giftedAt: Date | null;
  reservedBy: { name: string } | null;
  occasion: { id: string; name: string; slug: string } | null;
  giftHistory: { note: string | null; reaction: string | null; giftedAt: Date } | null;
}): WishSummary {
  return {
    id: wish.id,
    title: wish.title,
    description: wish.description,
    category: wish.category,
    priceFcfa: wish.priceFcfa,
    imageUrl: wish.imageUrl,
    productUrl: wish.productUrl,
    priority: wish.priority,
    status: wish.status,
    createdAt: wish.createdAt,
    giftedAt: wish.giftedAt,
    reservedByName: wish.reservedBy?.name ?? null,
    occasion: wish.occasion,
    giftHistory: wish.giftHistory
  };
}

export function isDemoMode() {
  return !hasDatabase();
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasDatabase()) {
    return demoData;
  }

  const recipient = await prisma.user.findFirst({
    where: { role: "RECIPIENT" },
    include: {
      profile: true,
      wishes: {
        include: {
          occasion: true,
          reservedBy: { select: { name: true } },
          giftHistory: true
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }]
      }
    }
  });

  const occasions = await prisma.occasion.findMany({
    include: {
      _count: {
        select: {
          wishes: true
        }
      }
    },
    orderBy: [{ eventDate: "asc" }, { name: "asc" }]
  });

  if (!recipient) {
    return demoData;
  }

  const preferences: PreferenceSummary | null = recipient.profile
    ? {
        favoriteColors: recipient.profile.favoriteColors,
        favoriteBrands: recipient.profile.favoriteBrands,
        favoriteStyles: recipient.profile.favoriteStyles,
        sizes: recipient.profile.sizes,
        avoidNotes: recipient.profile.avoidNotes
      }
    : null;

  const occasionSummaries: OccasionSummary[] = occasions.map((occasion) => ({
    id: occasion.id,
    name: occasion.name,
    slug: occasion.slug,
    description: occasion.description,
    eventDate: occasion.eventDate,
    wishCount: occasion._count.wishes
  }));

  const mapped = recipient.wishes.map(mapWish);

  return {
    demoMode: false,
    recipientName: recipient.name,
    activeWishes: mapped.filter((wish) => wish.status === "ACTIVE"),
    reservedWishes: mapped.filter((wish) => wish.status === "RESERVED"),
    giftedWishes: mapped.filter((wish) => wish.status === "GIFTED"),
    occasions: occasionSummaries,
    preferences
  };
}
