import { AppShell } from "@/components/app-shell";
import { IconGift } from "@/components/icons";
import { StatusPill } from "@/components/status-pill";
import { WishComposer } from "@/components/wish-composer";
import { WishExplorer } from "@/components/wish-explorer";
import { getDashboardData } from "@/lib/data";
import { requireCouple } from "@/lib/guard";
import type { AppRole } from "@/lib/types";

export default async function WishesPage() {
  const { session, recipientId } = await requireCouple();
  const currentRole = session.role as AppRole;
  const data = await getDashboardData(recipientId);
  const allWishes = [...data.activeWishes, ...data.reservedWishes, ...data.giftedWishes];

  return (
    <AppShell
      activePath="/wishes"
      occasions={data.occasions}
      userName={session.name}
      currentRole={currentRole}
    >
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconGift size={13} />}>
            Catalogue des attentions
          </StatusPill>
          <h1 className="page-header-banner__title">
            Toutes les envies cadeaux, organisées pour choisir juste.
          </h1>
          <p className="page-header-banner__desc">
            Explore les priorités, filtre par occasion, et réserve discrètement pour garder la surprise.
          </p>
        </div>
      </section>

      <section className="wishes-catalogue-section">
        <WishExplorer wishes={allWishes} occasions={data.occasions} currentRole={currentRole} />
      </section>

      <WishComposer occasions={data.occasions} />
    </AppShell>
  );
}
