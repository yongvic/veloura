import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  IconArrowRight,
  IconCalendar,
  IconGift,
  IconHeart,
  IconLock,
  IconSparkle
} from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishComposer } from "@/components/wish-composer";
import { WishExplorer } from "@/components/wish-explorer";
import { requireCouple } from "@/lib/guard";
import { getDashboardData } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import type { AppRole } from "@/lib/types";

export default async function HomePage() {
  const { session, user, recipientId } = await requireCouple();
  const currentRole = session.role as AppRole;
  const data = await getDashboardData(recipientId);
  const topWish = data.activeWishes[0];
  const reservedCount = data.reservedWishes.length;
  const partnerName = user.partner?.name ?? data.recipientName;

  return (
    <AppShell
      activePath="/"
      occasions={data.occasions}
      userName={session.name}
      currentRole={currentRole}
    >
      <section className="hero-section">
        <div className="hero-main shell-panel">
          <div className="hero-main__badge-row">
            <StatusPill tone="gold" icon={<IconSparkle size={13} />}>
              {currentRole === "RECIPIENT" ? "Tes envies" : `Liste de ${partnerName}`}
            </StatusPill>
          </div>

          <h1 className="hero-main__headline">
            {currentRole === "RECIPIENT"
              ? `${session.name}, note tes envies. ${partnerName} offrira avec attention.`
              : `Les envies de ${partnerName}, pour offrir juste.`}
          </h1>

          <p className="hero-main__lead">
            Un espace à deux : capturer une idée en quelques secondes, réserver sans gâcher
            la surprise, et garder le souvenir des cadeaux déjà offerts.
          </p>

          <div className="hero-stats-row">
            <Link href="/wishes" className="hero-stat-card">
              <span className="hero-stat-card__number">{data.activeWishes.length}</span>
              <span className="hero-stat-card__label">
                <IconGift size={14} /> Envies actives
              </span>
            </Link>

            <Link href="/wishes" className="hero-stat-card">
              <span className="hero-stat-card__number">{reservedCount}</span>
              <span className="hero-stat-card__label">
                <IconLock size={14} /> Cadeaux réservés
              </span>
            </Link>
          </div>
        </div>

        <div className="hero-spotlight shell-panel">
          <div className="spotlight-header">
            <StatusPill tone="accent" icon={<IconSparkle size={12} />}>
              À offrir en premier
            </StatusPill>
            <span className="spotlight-subtitle">Coup de cœur</span>
          </div>

          {topWish ? (
            <div className="spotlight-body">
              <h3 className="spotlight-title">
                <Link href={`/wishes/${topWish.id}`}>{topWish.title}</Link>
              </h3>
              <p className="spotlight-desc">
                {topWish.description ?? "Cette envie est au sommet de la liste."}
              </p>
              <div className="spotlight-meta-row">
                <StatusPill tone="primary">{topWish.category}</StatusPill>
                <StatusPill tone="neutral">
                  {topWish.occasion?.name ?? "Occasion libre"}
                </StatusPill>
              </div>
              <div className="spotlight-actions">
                <Link href={`/wishes/${topWish.id}`} className="btn-primary btn-primary--sm w-full">
                  <span>Voir cette envie</span>
                  <IconArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="spotlight-empty">
              <h3>La liste attend sa première envie</h3>
              <p>Ajoute une première idée cadeau pour lancer l’espace.</p>
            </div>
          )}
        </div>
      </section>

      <div className="dashboard-layout">
        <div className="dashboard-layout__main">
          <SectionHeading
            kicker="Sélection"
            title="Les envies en cours"
            body="Recherche et filtre par occasion pour trouver l'attention idéale."
          />

          <WishExplorer
            wishes={[...data.activeWishes, ...data.reservedWishes]}
            occasions={data.occasions}
            currentRole={currentRole}
          />
        </div>

        <aside className="dashboard-layout__aside">
          <section className="insight-card shell-panel">
            <div className="insight-card__header">
              <div className="insight-card__icon">
                <IconCalendar size={18} />
              </div>
              <div>
                <span className="insight-card__kicker">Calendrier</span>
                <h3 className="insight-card__title">Occasions proches</h3>
              </div>
            </div>

            <ul className="occasion-quick-list">
              {data.occasions.map((occasion) => (
                <li key={occasion.id} className="occasion-quick-item">
                  <Link href={`/occasions#${occasion.slug}`} className="occasion-quick-link">
                    <div className="occasion-quick-info">
                      <strong>{occasion.name}</strong>
                      <span>{formatShortDate(occasion.eventDate)}</span>
                    </div>
                    <StatusPill size="sm" tone={occasion.wishCount > 0 ? "accent" : "neutral"}>
                      {occasion.wishCount} {occasion.wishCount > 1 ? "envies" : "envie"}
                    </StatusPill>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/occasions" className="insight-card__footer-link">
              <span>Voir toutes les occasions</span>
              <IconArrowRight size={14} />
            </Link>
          </section>

          {data.preferences ? (
            <section className="insight-card shell-panel">
              <div className="insight-card__header">
                <div className="insight-card__icon">
                  <IconSparkle size={18} />
                </div>
                <div>
                  <span className="insight-card__kicker">Attentions</span>
                  <h3 className="insight-card__title">Guide des tailles et goûts</h3>
                </div>
              </div>

              <div className="pref-preview-tags">
                {data.preferences.sizes.length > 0 ? (
                  <div className="pref-preview-row">
                    <span className="pref-preview-label">Tailles :</span>
                    <div className="pref-pills">
                      {data.preferences.sizes.map((s) => (
                        <StatusPill key={s} size="sm" tone="primary">
                          {s}
                        </StatusPill>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <Link href="/preferences" className="insight-card__footer-link">
                <span>Consulter la fiche complète</span>
                <IconArrowRight size={14} />
              </Link>
            </section>
          ) : null}

          <section className="insight-card shell-panel">
            <div className="insight-card__header">
              <div className="insight-card__icon text-primary">
                <IconHeart size={18} />
              </div>
              <div>
                <span className="insight-card__kicker">Mémoire</span>
                <h3 className="insight-card__title">Dernier souvenir</h3>
              </div>
            </div>

            {data.giftedWishes[0] ? (
              <div className="memory-preview-box">
                <p className="memory-preview-title">
                  <Link href={`/wishes/${data.giftedWishes[0].id}`}>
                    {data.giftedWishes[0].title}
                  </Link>
                </p>
                <span className="memory-preview-date">
                  {formatShortDate(data.giftedWishes[0].giftedAt)}
                </span>
              </div>
            ) : (
              <p className="insight-empty-text">
                Les cadeaux déjà offerts apparaîtront ici.
              </p>
            )}

            <Link href="/history" className="insight-card__footer-link">
              <span>Ouvrir le livre d’or</span>
              <IconArrowRight size={14} />
            </Link>
          </section>
        </aside>
      </div>

      <WishComposer occasions={data.occasions} />
    </AppShell>
  );
}
