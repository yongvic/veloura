import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { WishComposer } from "@/components/wish-composer";
import { getDashboardData } from "@/lib/data";

export default async function WishesPage() {
  const data = await getDashboardData();

  return (
    <AppShell activePath="/wishes">
      <section className="page-hero shell-panel">
        <SectionHeading
          kicker="Envies"
          title="Toutes les idees cadeau, triees pour agir vite."
          body="Retrouve les envies prioritaires, les demandes plus souples et les cadeaux deja reserves."
          aside={
            <div className="budget-pills">
              <StatusPill>moins de 10 000 FCFA</StatusPill>
              <StatusPill>10 000 - 25 000 FCFA</StatusPill>
              <StatusPill>25 000 - 50 000 FCFA</StatusPill>
            </div>
          }
        />
      </section>

      <div className="stack">
        <section className="shell-panel">
          <SectionHeading
            kicker="A offrir"
            title="Les envies actives"
            body="Les cartes montrent budget, occasion, priorite et details utiles au premier regard."
          />
          <div className="wish-grid">
            {data.activeWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} demoMode={data.demoMode} />
            ))}
          </div>
        </section>

        <section className="shell-panel">
          <SectionHeading
            kicker="Mode discret"
            title="Les envies deja reservees"
            body="Ce bloc garde la surprise intacte tout en evitant les oublis ou les doublons."
          />
          <div className="wish-grid">
            {data.reservedWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} demoMode={data.demoMode} compact />
            ))}
          </div>
        </section>
      </div>

      <WishComposer occasions={data.occasions} demoMode={data.demoMode} />
    </AppShell>
  );
}
