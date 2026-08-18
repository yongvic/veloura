import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconGift,
  IconHeart,
  IconLock,
  IconSparkle,
  IconTag
} from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WishCard, priorityConfig } from "@/components/wish-card";
import { getDashboardData } from "@/lib/data";
import { requireCouple } from "@/lib/guard";
import { formatShortDate } from "@/lib/format";
import type { AppRole } from "@/lib/types";

export default async function WishDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, recipientId } = await requireCouple();
  const currentRole = session.role as AppRole;
  const data = await getDashboardData(recipientId);
  const allWishes = [...data.activeWishes, ...data.reservedWishes, ...data.giftedWishes];
  const wish = allWishes.find((entry) => entry.id === id);

  if (!wish) {
    notFound();
  }

  const isGifted = wish.status === "GIFTED";
  const isReserved = wish.status === "RESERVED";
  const priorityInfo = priorityConfig[wish.priority] || priorityConfig.WOULD_LOVE;

  // Find related wishes
  const relatedWishes = allWishes.filter(
    (w) => w.id !== wish.id && (w.category === wish.category || w.occasion?.id === wish.occasion?.id)
  ).slice(0, 3);

  return (
    <AppShell
      activePath="/wishes"
      backHref="/wishes"
      backLabel="Retour à la liste des envies"
      occasions={data.occasions}
      userName={session.name}
      currentRole={currentRole}
    >
      {/* Breadcrumb row */}
      <nav aria-label="Fil d'Ariane" className="breadcrumb-nav">
        <Link href="/" className="breadcrumb-link">Accueil</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/wishes" className="breadcrumb-link">Envies</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current" aria-current="page">{wish.title}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="wish-detail-layout">
        {/* Left: Media & Visual Representation */}
        <div className="wish-detail-media shell-panel">
          <div className="wish-detail-image-wrap">
            {wish.imageUrl ? (
              <Image
                src={wish.imageUrl}
                alt={wish.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                className="wish-detail-image"
              />
            ) : (
              <div className="wish-detail-placeholder">
                <IconGift size={64} />
                <span>{wish.category}</span>
              </div>
            )}
          </div>

          {/* Status highlight strip */}
          <div className="wish-detail-status-strip">
            <StatusPill tone={priorityInfo.tone} icon={<IconSparkle size={13} />}>
              {priorityInfo.label}
            </StatusPill>
            {isGifted ? (
              <StatusPill tone="success" icon={<IconCheck size={13} />}>
                Déjà offert le {formatShortDate(wish.giftedAt)}
              </StatusPill>
            ) : isReserved ? (
              <StatusPill tone="accent" icon={<IconLock size={13} />}>
                Réservé en mode discret
              </StatusPill>
            ) : (
              <StatusPill tone="neutral">Disponible pour achat</StatusPill>
            )}
          </div>
        </div>

        {/* Right: Information, Details & Actions */}
        <div className="wish-detail-info-column">
          <div className="wish-detail-main shell-panel">
            <div className="wish-detail-category-row">
              <span className="detail-category-tag">{wish.category}</span>
              {wish.occasion ? (
                <Link
                  href={`/occasions#${wish.occasion.slug}`}
                  className="detail-occasion-tag"
                >
                  <IconGift size={13} />
                  <span>{wish.occasion.name}</span>
                </Link>
              ) : (
                <span className="detail-occasion-tag">Occasion libre</span>
              )}
            </div>

            <h1 className="wish-detail-title">{wish.title}</h1>

            {/* Description / Story */}
            <div className="wish-detail-desc-block">
              <h3 className="detail-block-title">Description & Précisions</h3>
              <p className="detail-desc-text">
                {wish.description ??
                  "Aucune précision particulière saisie pour cette envie. Tu peux te fier aux préférences générales de taille et de goût."}
              </p>
            </div>

            {/* Facts specifications */}
            <div className="wish-detail-specs-grid">
              <div className="detail-spec-card">
                <span className="spec-icon"><IconTag size={16} /></span>
                <div>
                  <span className="spec-title">Catégorie</span>
                  <strong className="spec-value">{wish.category}</strong>
                </div>
              </div>

              <div className="detail-spec-card">
                <span className="spec-icon"><IconCalendar size={16} /></span>
                <div>
                  <span className="spec-title">Occasion</span>
                  <strong className="spec-value">{wish.occasion?.name ?? "Tout moment"}</strong>
                </div>
              </div>

              <div className="detail-spec-card">
                <span className="spec-icon"><IconSparkle size={16} /></span>
                <div>
                  <span className="spec-title">Priorité</span>
                  <strong className="spec-value">{priorityInfo.label}</strong>
                </div>
              </div>

              <div className="detail-spec-card">
                <span className="spec-icon"><IconClock size={16} /></span>
                <div>
                  <span className="spec-title">Ajouté le</span>
                  <strong className="spec-value">{formatShortDate(wish.createdAt)}</strong>
                </div>
              </div>
            </div>

            {/* Merchant link button if present */}
            {wish.productUrl ? (
              <div className="merchant-link-box">
                <a
                  href={wish.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-merchant-link"
                >
                  <IconExternalLink size={18} />
                  <span>Ouvrir le lien de la boutique en ligne</span>
                </a>
              </div>
            ) : null}

            {/* Interactive Card Action Area */}
            <div className="wish-detail-actions-panel">
              <WishCard
                wish={wish}
                currentRole={currentRole}
                compact
                showActions={true}
              />
            </div>
          </div>

          {/* Memory block if gifted */}
          {wish.giftHistory ? (
            <div className="wish-detail-memory-card shell-panel">
              <div className="memory-card-head">
                <IconHeart size={20} className="text-primary" />
                <div>
                  <span className="memory-card-kicker">Souvenir immortalisé</span>
                  <h3 className="memory-card-title">
                    Réaction : {wish.giftHistory.reaction ?? "Un moment inoubliable"}
                  </h3>
                </div>
              </div>

              {wish.giftHistory.note ? (
                <p className="memory-card-note">« {wish.giftHistory.note} »</p>
              ) : null}

              <span className="memory-card-date">
                Offert avec amour le {formatShortDate(wish.giftHistory.giftedAt ?? wish.giftedAt)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Related Wishes Section to prevent dead ends */}
      {relatedWishes.length > 0 ? (
        <section className="related-wishes-section">
          <SectionHeading
            kicker="À découvrir aussi"
            title="Autres envies qui pourraient t'inspirer"
            body="Idées dans la même catégorie ou rattachées à la même occasion."
          />
          <div className="wish-grid">
            {relatedWishes.map((rel) => (
              <WishCard
                key={rel.id}
                wish={rel}
                currentRole={currentRole}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
