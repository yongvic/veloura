import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/data";

const sections = [
  ["Couleurs preferees", "favoriteColors"],
  ["Marques aimees", "favoriteBrands"],
  ["Styles preferes", "favoriteStyles"],
  ["Tailles utiles", "sizes"],
  ["A eviter", "avoidNotes"]
] as const;

export default async function PreferencesPage() {
  const data = await getDashboardData();
  const preferences = data.preferences;

  return (
    <AppShell activePath="/preferences">
      <section className="page-hero shell-panel">
        <SectionHeading
          kicker="Preferences"
          title="Un profil simple pour mieux offrir juste."
          body="Couleurs, tailles, styles, marques et choses a eviter: tout ce qui rend le cadeau plus personnel."
        />
      </section>

      <section className="preferences-grid">
        {sections.map(([label, key]) => (
          <article key={key} className="preference-card shell-panel">
            <p className="eyebrow">{label}</p>
            <div className="chip-cloud">
              {preferences?.[key]?.length ? (
                preferences[key].map((item) => (
                  <StatusPill key={item} tone={key === "avoidNotes" ? "accent" : "primary"}>
                    {item}
                  </StatusPill>
                ))
              ) : (
                <p className="section-copy">Ajoute des preferences pour personnaliser les choix.</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
