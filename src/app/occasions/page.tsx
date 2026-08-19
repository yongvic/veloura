import { AppShell } from "@/components/app-shell";
import {
  IconCalendar,
  IconClock,
  IconGift
} from "@/components/icons";
import { LocalDate } from "@/components/local-date";
import { OccasionCreator, OccasionDateEditor } from "@/components/occasion-manager";
import { StatusPill } from "@/components/status-pill";
import { WishCard } from "@/components/wish-card";
import { WishComposer } from "@/components/wish-composer";
import { getCoupleDashboard } from "@/lib/dashboard";

export default async function OccasionsPage() {
  const { session, currentRole, data } = await getCoupleDashboard();
  const allWishes = [...data.activeWishes, ...data.reservedWishes, ...data.giftedWishes];
  const canManage = currentRole === "RECIPIENT";

  return (
    <AppShell activePath="/occasions" occasions={data.occasions} userName={session.name} currentRole={currentRole}>
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconCalendar size={13} />}>
            Moments précieux
          </StatusPill>
          <h1 className="page-header-banner__title">
            Les attentions s’attachent à des moments, pas seulement à des objets.
          </h1>
          <p className="page-header-banner__desc">
            Anniversaire, Noël, Saint-Valentin ou douce surprise du quotidien :
            chaque occasion crée son propre rythme pour faire plaisir au bon moment.
          </p>
          {canManage ? (
            <div className="page-header-banner__actions">
              <OccasionCreator />
            </div>
          ) : null}
        </div>
      </section>

      {/* Occasion Cards Board */}
      <div className="occasions-board-grid">
        {data.occasions.map((occasion) => {
          const associatedWishes = allWishes.filter(
            (w) => w.occasion?.id === occasion.id || w.occasion?.slug === occasion.slug
          );

          return (
            <article
              key={occasion.id}
              id={occasion.slug}
              className="occasion-panel shell-panel"
            >
              <div className="occasion-panel__head">
                <div className="occasion-panel__identity">
                  <div className="occasion-panel__icon">
                    <IconGift size={22} />
                  </div>
                  <div>
                    <span className="occasion-panel__kicker">Occasion</span>
                    <h2 className="occasion-panel__title">{occasion.name}</h2>
                  </div>
                </div>

                <StatusPill
                  tone={associatedWishes.length > 0 ? "primary" : "neutral"}
                  size="md"
                >
                  {associatedWishes.length} {associatedWishes.length > 1 ? "envies" : "envie"}
                </StatusPill>
              </div>

              <p className="occasion-panel__desc">
                {occasion.description ?? "Un moment qui mérite toute votre attention."}
              </p>

              <div className="occasion-panel__date-strip">
                <span className="date-strip-item">
                  <IconCalendar size={14} />
                  <strong><LocalDate value={occasion.eventDate} /></strong>
                </span>
                <span className="date-strip-slug">
                  <IconClock size={14} />
                  <span>{occasion.eventDate ? "Date fixée" : "Tout au long de l'année"}</span>
                </span>
              </div>

              {canManage ? <OccasionDateEditor occasion={occasion} /> : null}

              {/* Associated Wishes Grid */}
              {associatedWishes.length > 0 ? (
                <div className="occasion-panel__wishes-preview">
                  <h4 className="preview-heading">Envies liées à cette occasion :</h4>
                  <div className="wish-grid">
                    {associatedWishes.map((wish) => (
                      <WishCard
                        key={wish.id}
                        wish={wish}
                        currentRole={currentRole}
                        compact
                        occasions={data.occasions}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="occasion-panel__empty-slot">
                  <p>Aucune envie n’est encore rattachée à cette occasion.</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {canManage ? <WishComposer occasions={data.occasions} /> : null}
    </AppShell>
  );
}
