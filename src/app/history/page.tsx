import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { getDashboardData } from "@/lib/data";

export default async function HistoryPage() {
  const data = await getDashboardData();

  return (
    <AppShell activePath="/history">
      <section className="page-hero shell-panel">
        <SectionHeading
          kicker="Deja offert"
          title="L'historique des cadeaux devient une memoire de couple."
          body="Chaque cadeau archive garde sa date, son occasion et, si besoin, un petit souvenir."
        />
      </section>

      <section className="stack">
        <div className="timeline shell-panel">
          <SectionHeading
            kicker="Chronologie"
            title="Les attentions deja offertes"
            body="Une lecture simple et emotionnelle plutot qu'une simple liste terminee."
          />
          <div className="wish-grid">
            {data.giftedWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} demoMode={data.demoMode} />
            ))}
          </div>
        </div>

        <section className="shell-panel memory-strip">
          <p className="eyebrow">Signature Veloura</p>
          <h3>Ce qui a deja ete offert ne disparait pas, cela raconte votre histoire.</h3>
          <div className="memory-strip__badges">
            <StatusPill tone="success">Souvenir</StatusPill>
            <StatusPill tone="accent">Reaction</StatusPill>
            <StatusPill tone="primary">Occasion</StatusPill>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
