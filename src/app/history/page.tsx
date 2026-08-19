import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { IconGift, IconHeart, IconSparkle } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { getCoupleDashboard } from "@/lib/dashboard";

export default async function HistoryPage() {
  const { session, currentRole, data } = await getCoupleDashboard();
  const giftedWishes = data.giftedWishes;

  return (
    <AppShell
      activePath="/history"
      occasions={data.occasions}
      userName={session.name}
      currentRole={currentRole}
    >
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconHeart size={13} />}>
            Livre d’or
          </StatusPill>
          <h1 className="page-header-banner__title">
            Ce qui a été offert ne disparaît pas : cela raconte votre histoire.
          </h1>
          <p className="page-header-banner__desc">
            Retrouve les cadeaux partagés, les dates célébrées et les souvenirs gardés.
          </p>

          <div className="history-summary-stats">
            <div className="history-stat-box">
              <strong className="stat-number">{giftedWishes.length}</strong>
              <span className="stat-label">Moments célébrés</span>
            </div>
          </div>
        </div>
      </section>

      {giftedWishes.length > 0 ? (
        <div className="history-timeline-section">
          <SectionHeading
            kicker="Chronologie"
            title="Les souvenirs immortalisés"
            body="Chaque attention garde sa date, son occasion et l'émotion partagée."
          />

          <div className="history-wishes-grid">
            {giftedWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} currentRole={currentRole} />
            ))}
          </div>
        </div>
      ) : (
        <div className="history-empty-state shell-panel">
          <div className="empty-icon-wrap">
            <IconHeart size={36} />
          </div>
          <h3>Aucun cadeau archivé pour le moment</h3>
          <p>
            Dès qu’un cadeau est marqué comme offert, il s’inscrit ici avec votre souvenir.
          </p>
          <Link href="/wishes" className="btn-primary">
            <IconGift size={16} />
            <span>Découvrir les envies actives</span>
          </Link>
        </div>
      )}

      <section className="memory-signature-banner shell-panel">
        <div className="signature-badge">
          <IconSparkle size={18} />
          <span>Signature Veloura</span>
        </div>
        <h3 className="signature-title">
          Offrir n’est pas une simple transaction, c’est un geste d’attention.
        </h3>
      </section>
    </AppShell>
  );
}
