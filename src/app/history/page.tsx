import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconGift,
  IconHeart,
  IconPlus,
  IconSparkle
} from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { getDashboardData } from "@/lib/data";
import { formatFcfa, formatShortDate } from "@/lib/format";

export default async function HistoryPage() {
  const data = await getDashboardData();
  const giftedWishes = data.giftedWishes;
  const totalGiftedBudget = giftedWishes.reduce(
    (sum, wish) => sum + (wish.priceFcfa ?? 0),
    0
  );

  return (
    <AppShell activePath="/history" occasions={data.occasions} demoMode={data.demoMode}>
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconHeart size={13} />}>
            Livre d'or & Mémoire
          </StatusPill>
          <h1 className="page-header-banner__title">
            Ce qui a été offert ne disparaît pas : cela raconte votre histoire.
          </h1>
          <p className="page-header-banner__desc">
            Retrouve l'historique complet des cadeaux partagés, les dates célébrées,
            les réactions et les anecdotes précieuses accumulées au fil du temps.
          </p>

          <div className="history-summary-stats">
            <div className="history-stat-box">
              <strong className="stat-number">{giftedWishes.length}</strong>
              <span className="stat-label">Moments célébrés</span>
            </div>
            <div className="history-stat-box">
              <strong className="stat-number text-gradient-gold">
                {formatFcfa(totalGiftedBudget)}
              </strong>
              <span className="stat-label">Valeur des attentions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gifted Wishes Timeline */}
      {giftedWishes.length > 0 ? (
        <div className="history-timeline-section">
          <SectionHeading
            kicker="Chronologie"
            title="Les souvenirs immortalisés"
            body="Chaque attention garde sa date, son occasion et l'émotion partagée lors de sa remise."
          />

          <div className="history-wishes-grid">
            {giftedWishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                demoMode={data.demoMode}
                showActions={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="history-empty-state shell-panel">
          <div className="empty-icon-wrap text-primary">
            <IconHeart size={36} />
          </div>
          <h3>Aucun cadeau archivé pour le moment</h3>
          <p>
            Dès que tu auras offert un cadeau de la liste et cliqué sur "Marquer comme offert",
            il s'inscrira automatiquement ici avec votre souvenir personnalisé.
          </p>
          <Link href="/wishes" className="btn-primary">
            <IconGift size={16} />
            <span>Découvrir les envies actives</span>
          </Link>
        </div>
      )}

      {/* Signature Veloura Box */}
      <section className="memory-signature-banner shell-panel">
        <div className="signature-badge">
          <IconSparkle size={18} />
          <span>Signature Veloura</span>
        </div>
        <h3 className="signature-title">
          Offrir n'est pas une simple transaction, c'est un geste d'attention intime.
        </h3>
        <p className="signature-desc">
          Ce carnet de souvenirs grandit à chaque occasion partagée.
        </p>
      </section>
    </AppShell>
  );
}
