import { AppShell } from "@/components/app-shell";
import { IconGift, IconSparkle } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishComposer } from "@/components/wish-composer";
import { WishExplorer } from "@/components/wish-explorer";
import { getDashboardData } from "@/lib/data";

export default async function WishesPage() {
  const data = await getDashboardData();
  const allWishes = [...data.activeWishes, ...data.reservedWishes, ...data.giftedWishes];

  return (
    <AppShell activePath="/wishes" occasions={data.occasions} demoMode={data.demoMode}>
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconGift size={13} />}>
            Catalogue des attentions
          </StatusPill>
          <h1 className="page-header-banner__title">
            Toutes les envies cadeaux, organisées pour choisir juste.
          </h1>
          <p className="page-header-banner__desc">
            Explore les envies prioritaires, filtre par occasion ou par tranche de budget FCFA,
            et réserve discrètement pour garder l'effet de surprise intact.
          </p>
        </div>
      </section>

      <section className="wishes-catalogue-section">
        <WishExplorer
          wishes={allWishes}
          occasions={data.occasions}
          demoMode={data.demoMode}
          title="Toutes les envies"
        />
      </section>

      <WishComposer occasions={data.occasions} demoMode={data.demoMode} />
    </AppShell>
  );
}
