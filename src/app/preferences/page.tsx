import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  IconArrowRight,
  IconBookmark,
  IconCheck,
  IconGift,
  IconHeart,
  IconSparkle,
  IconTag,
  IconUser,
  IconX
} from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/data";

const preferenceSections = [
  {
    key: "sizes" as const,
    title: "Tailles & Mensurations",
    subtitle: "Vêtements, chaussures, bagues",
    icon: IconTag,
    tone: "primary" as const,
    advice: "Vérifie toujours ces références avant de passer commande d'un vêtement ou d'un bijou."
  },
  {
    key: "favoriteColors" as const,
    title: "Couleurs de prédilection",
    subtitle: "Teintes qui la subliment",
    icon: IconSparkle,
    tone: "gold" as const,
    advice: "Ses tons fétiches pour les sacs, les pièces de prêt-à-porter et la décoration."
  },
  {
    key: "favoriteBrands" as const,
    title: "Marques & Boutiques chéries",
    subtitle: "Créateurs et enseignes favorites",
    icon: IconGift,
    tone: "accent" as const,
    advice: "Les univers et boutiques où tu es certain(e) de trouver une attention qui lui plaît."
  },
  {
    key: "favoriteStyles" as const,
    title: "Styles & Esthétiques",
    subtitle: "Coupes, matières, finitions",
    icon: IconHeart,
    tone: "neutral" as const,
    advice: "Privilégie ces lignes épurées et matières nobles pour viser juste."
  },
  {
    key: "avoidNotes" as const,
    title: "À éviter formellement",
    subtitle: "Fausses notes & allergies",
    icon: IconX,
    tone: "warning" as const,
    advice: "Ce qu'elle n'aime pas ou qui encombre inutilement son quotidien."
  }
];

export default async function PreferencesPage() {
  const data = await getDashboardData();
  const preferences = data.preferences;

  return (
    <AppShell activePath="/preferences" occasions={data.occasions} demoMode={data.demoMode}>
      <section className="page-header-banner shell-panel">
        <div className="page-header-banner__content">
          <StatusPill tone="gold" icon={<IconUser size={13} />}>
            Guide des attentions
          </StatusPill>
          <h1 className="page-header-banner__title">
            Le profil d'attentions pour ne jamais se tromper.
          </h1>
          <p className="page-header-banner__desc">
            Tailles exactes, couleurs préférées, marques coup de cœur et précisions utiles :
            tout ce qui transforme une bonne idée en cadeau parfait sans stress.
          </p>
        </div>
      </section>

      {/* Preferences Cards Grid */}
      <div className="preferences-board-grid">
        {preferenceSections.map((sec) => {
          const items = preferences?.[sec.key] ?? [];
          const Icon = sec.icon;

          return (
            <article key={sec.key} className="preference-card-panel shell-panel">
              <div className="preference-card-head">
                <div className="preference-card-head__icon">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="preference-card-kicker">{sec.subtitle}</span>
                  <h2 className="preference-card-title">{sec.title}</h2>
                </div>
              </div>

              <div className="preference-chips-box">
                {items.length > 0 ? (
                  items.map((item) => (
                    <StatusPill key={item} tone={sec.tone} size="md">
                      {item}
                    </StatusPill>
                  ))
                ) : (
                  <p className="preference-empty-note">
                    Aucune note renseignée pour cette catégorie.
                  </p>
                )}
              </div>

              <div className="preference-card-advice">
                <p>{sec.advice}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Reassurance Banner */}
      <section className="preference-reassurance shell-panel">
        <div className="reassurance-icon">
          <IconSparkle size={24} />
        </div>
        <div className="reassurance-text">
          <h3>Un doute sur une taille ou un modèle ?</h3>
          <p>
            Toutes les envies enregistrées dans l'onglet <strong>Envies</strong> comportent
            également des descriptions précises saisies au fil de l'eau.
          </p>
        </div>
        <Link href="/wishes" className="btn-primary">
          <span>Consulter les envies</span>
          <IconArrowRight size={15} />
        </Link>
      </section>
    </AppShell>
  );
}
