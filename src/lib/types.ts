export type WishPriority = "MUST_HAVE" | "WOULD_LOVE" | "MAYBE_LATER" | "LUXURY";
export type WishStatus = "ACTIVE" | "RESERVED" | "GIFTED";

export type OccasionSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  eventDate: Date | null;
  wishCount: number;
};

export type WishSummary = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priceFcfa: number | null;
  imageUrl: string | null;
  productUrl: string | null;
  priority: WishPriority;
  status: WishStatus;
  createdAt: Date;
  giftedAt: Date | null;
  reservedByName: string | null;
  occasion:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | null;
  giftHistory:
    | {
        note: string | null;
        reaction: string | null;
        giftedAt: Date;
      }
    | null;
};

export type PreferenceSummary = {
  favoriteColors: string[];
  favoriteBrands: string[];
  favoriteStyles: string[];
  sizes: string[];
  avoidNotes: string[];
};

export type DashboardData = {
  demoMode: boolean;
  recipientName: string;
  activeWishes: WishSummary[];
  reservedWishes: WishSummary[];
  giftedWishes: WishSummary[];
  occasions: OccasionSummary[];
  preferences: PreferenceSummary | null;
};
