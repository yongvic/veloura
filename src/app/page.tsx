import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { WishComposer } from "@/components/wish-composer";
import { getDashboardData } from "@/lib/data";
import { formatFcfa, formatShortDate } from "@/lib/format";

export default async function HomePage() {
  const data = await getDashboardData();
  const topWish = data.activeWishes[0];
  const reservedCount = data.reservedWishes.length;
  const totalBudget = data.activeWishes.reduce((sum, wish) => sum + (wish.priceFcfa ?? 0), 0);

  return (
    <AppShell activePath="/">
      <section className="hero">
        <div className="hero__copy shell-panel">
          <StatusPill tone="accent">{data.demoMode ? "Demo mode" : "Neon connecte"}</StatusPill>
          <p className="eyebrow">Espace prive</p>
          <h2>Veloura aide {data.recipientName} a exprimer ses envies, et toi a offrir avec attention.</h2>
          <p className="section-copy">
            Une wishlist premium pour ajouter vite, choisir sans stress, marquer ce qui est deja offert
            et garder une trace des beaux moments.
          </p>
          <div className="hero__stats">
            <div>
              <strong>{data.activeWishes.length}</strong>
              <span>envies actives</span>
            </div>
            <div>
              <strong>{reservedCount}</strong>
              <span>cadeaux reserves</span>
            </div>
            <div>
              <strong>{formatFcfa(totalBudget)}</strong>
              <span>budget visible</span>
            </div>
          </div>
        </div>

        <div className="hero__spotlight shell-panel">
          <p className="eyebrow">A offrir en premier</p>
          {topWish ? (
            <>
              <h3>{topWish.title}</h3>
              <p>{topWish.description}</p>
              <div className="hero__spotlight-meta">
                <StatusPill tone="primary">{topWish.occasion?.name ?? "Occasion libre"}</StatusPill>
                <StatusPill>{formatFcfa(topWish.priceFcfa)}</StatusPill>
              </div>
            </>
          ) : (
            <>
              <h3>La liste attend sa premiere envie.</h3>
              <p>Ajoute un premier cadeau pour lancer cette experience.</p>
            </>
          )}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-grid__main">
          <SectionHeading
            kicker="Envies en cours"
            title="Des choix clairs, une vraie priorite visuelle."
            body="Les envies importantes remontent naturellement. Le mode discret te permet de reserver sans casser la surprise."
          />
          <div className="wish-grid">
            {[...data.activeWishes, ...data.reservedWishes].map((wish) => (
              <WishCard key={wish.id} wish={wish} demoMode={data.demoMode} compact />
            ))}
          </div>
        </div>

        <aside className="dashboard-grid__aside">
          <section className="insight-card shell-panel">
            <p className="eyebrow">Moments a venir</p>
            <h3>Occasions proches</h3>
            <ul className="occasion-list">
              {data.occasions.map((occasion) => (
                <li key={occasion.id}>
                  <div>
                    <strong>{occasion.name}</strong>
                    <span>{formatShortDate(occasion.eventDate)}</span>
                  </div>
                  <StatusPill>{occasion.wishCount} envies</StatusPill>
                </li>
              ))}
            </ul>
          </section>

          <section className="insight-card shell-panel">
            <p className="eyebrow">Memoire</p>
            <h3>Dernier souvenir offert</h3>
            {data.giftedWishes[0] ? (
              <>
                <p>{data.giftedWishes[0].title}</p>
                <small>
                  {data.giftedWishes[0].giftHistory?.reaction ?? "Tres aime"} ·{" "}
                  {formatShortDate(data.giftedWishes[0].giftedAt)}
                </small>
              </>
            ) : (
              <p>Les cadeaux archives apparaitront ici.</p>
            )}
          </section>
        </aside>
      </section>

      <WishComposer occasions={data.occasions} demoMode={data.demoMode} />
    </AppShell>
  );
}
