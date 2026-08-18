import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export default async function OccasionsPage() {
  const data = await getDashboardData();

  return (
    <AppShell activePath="/occasions">
      <section className="page-hero shell-panel">
        <SectionHeading
          kicker="Occasions"
          title="Les envies s'attachent a des moments, pas seulement a des objets."
          body="Anniversaire, Noel, Saint-Valentin ou surprise, chaque occasion cree son propre rythme."
        />
      </section>

      <section className="occasion-board">
        {data.occasions.map((occasion) => (
          <article key={occasion.id} className="occasion-card shell-panel">
            <div className="occasion-card__head">
              <div>
                <p className="eyebrow">Occasion</p>
                <h3>{occasion.name}</h3>
              </div>
              <StatusPill tone="accent">{occasion.wishCount} envies</StatusPill>
            </div>
            <p>{occasion.description ?? "Un moment qui merite une attention particuliere."}</p>
            <div className="occasion-card__footer">
              <span>{formatShortDate(occasion.eventDate)}</span>
              <span>{occasion.slug}</span>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
