"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { deleteWish, markGifted, reserveWish } from "@/app/actions";
import {
  IconBookmark,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconGift,
  IconHeart,
  IconLock,
  IconSparkle,
  IconTrash,
  IconX
} from "@/components/icons";
import { StatusPill } from "@/components/status-pill";
import { formatShortDate } from "@/lib/format";
import type { WishPriority, WishSummary } from "@/lib/types";

export const priorityConfig: Record<
  WishPriority,
  { label: string; tone: "primary" | "accent" | "gold" | "muted"; icon: string }
> = {
  MUST_HAVE: { label: "Indispensable", tone: "accent", icon: "★" },
  WOULD_LOVE: { label: "Coup de cœur", tone: "primary", icon: "♥" },
  LUXURY: { label: "Luxe & Rêve", tone: "gold", icon: "✦" },
  MAYBE_LATER: { label: "Plus tard", tone: "muted", icon: "•" }
};

export const reactionOptions = [
  "A adoré !",
  "Émue aux larmes",
  "Grand coup de cœur",
  "Porté/utilisé tout de suite",
  "Très heureuse",
  "Un souvenir inoubliable"
];

export function WishCard({
  wish,
  layout = "grid",
  compact = false,
  showActions = true,
  currentRole = "RECIPIENT"
}: {
  wish: WishSummary;
  layout?: "grid" | "list";
  compact?: boolean;
  showActions?: boolean;
  currentRole?: "RECIPIENT" | "GIFTER";
}) {
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(
    wish.giftHistory?.reaction ?? reactionOptions[0]
  );
  const [customNote, setCustomNote] = useState(wish.giftHistory?.note ?? "");

  const isGifted = wish.status === "GIFTED";
  const isReserved = wish.status === "RESERVED";
  const canGift = currentRole === "GIFTER";
  const priorityInfo = priorityConfig[wish.priority] || priorityConfig.WOULD_LOVE;

  async function handleReserve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.set("wishId", wish.id);
    await reserveWish(formData);
    setIsPending(false);
    setIsReserveModalOpen(false);
  }

  async function handleGift(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.set("wishId", wish.id);
    formData.set("note", customNote);
    formData.set("reaction", selectedReaction);
    await markGifted(formData);
    setIsPending(false);
    setIsGiftModalOpen(false);
  }

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.set("wishId", wish.id);
    await deleteWish(formData);
    setIsPending(false);
    setIsDeleteModalOpen(false);
  }

  if (layout === "list") {
    return (
      <>
        <article className={`wish-list-row ${isReserved ? "is-reserved" : ""} ${isGifted ? "is-gifted" : ""}`}>
          <div className="wish-list-row__media">
            {wish.imageUrl ? (
              <Image
                src={wish.imageUrl}
                alt={wish.title}
                width={80}
                height={80}
                className="wish-list-row__thumb"
              />
            ) : (
              <div className="wish-list-row__placeholder">
                <IconGift size={24} />
              </div>
            )}
          </div>

          <div className="wish-list-row__info">
            <div className="wish-list-row__header">
              <span className="wish-list-row__category">{wish.category}</span>
              <StatusPill tone={priorityInfo.tone} size="sm">
                {priorityInfo.label}
              </StatusPill>
              {isReserved ? (
                <StatusPill tone="accent" size="sm" icon={<IconLock size={12} />}>
                  Réservé
                </StatusPill>
              ) : isGifted ? (
                <StatusPill tone="success" size="sm" icon={<IconCheck size={12} />}>
                  Offert
                </StatusPill>
              ) : null}
            </div>
            <h3 className="wish-list-row__title">
              <Link href={`/wishes/${wish.id}`}>{wish.title}</Link>
            </h3>
            {wish.description ? (
              <p className="wish-list-row__desc">{wish.description}</p>
            ) : null}
          </div>

          <div className="wish-list-row__meta">
            <div className="wish-list-row__occasion">
              <IconGift size={13} /> {wish.occasion?.name ?? "Occasion libre"}
            </div>
          </div>

          {showActions ? (
            <div className="wish-list-row__actions">
              <Link href={`/wishes/${wish.id}`} className="btn-secondary btn-secondary--sm">
                Détails
              </Link>
              {canGift && !isGifted && !isReserved ? (
                <button
                  type="button"
                  className="btn-primary btn-primary--sm"
                  onClick={() => setIsReserveModalOpen(true)}
                >
                  <IconBookmark size={14} /> Réserver
                </button>
              ) : null}
              {canGift && !isGifted && isReserved ? (
                <button
                  type="button"
                  className="btn-accent btn-accent--sm"
                  onClick={() => setIsGiftModalOpen(true)}
                >
                  <IconCheck size={14} /> Offert
                </button>
              ) : null}
            </div>
          ) : null}
        </article>

        {/* Modal Réserver */}
        {renderModals()}
      </>
    );
  }

  return (
    <>
      <article
        className={`wish-card ${compact ? "wish-card--compact" : ""} ${
          isReserved ? "wish-card--reserved" : ""
        } ${isGifted ? "wish-card--gifted" : ""}`}
      >
        <div className="wish-card__media-wrap">
          <div className="wish-card__media">
            {wish.imageUrl ? (
              <Image
                src={wish.imageUrl}
                alt={wish.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="wish-card__image"
              />
            ) : (
              <div className="wish-card__placeholder">
                <div className="wish-card__placeholder-icon">
                  <IconGift size={36} />
                </div>
                <span className="wish-card__placeholder-cat">{wish.category}</span>
              </div>
            )}
            <div className="wish-card__media-overlay" />
          </div>

          {/* Badges en superposition */}
          <div className="wish-card__badges">
            <StatusPill tone={priorityInfo.tone} size="sm">
              {priorityInfo.label}
            </StatusPill>
            {isGifted ? (
              <StatusPill tone="success" size="sm" icon={<IconCheck size={13} />}>
                Déjà offert
              </StatusPill>
            ) : isReserved ? (
              <StatusPill tone="accent" size="sm" icon={<IconLock size={13} />}>
                Réservé en secret
              </StatusPill>
            ) : (
              <StatusPill tone="neutral" size="sm">
                {wish.category}
              </StatusPill>
            )}
          </div>
        </div>

        <div className="wish-card__body">
          <div className="wish-card__heading">
            <h3 className="wish-card__title">
              <Link href={`/wishes/${wish.id}`}>{wish.title}</Link>
            </h3>
          </div>

          {wish.description ? (
            <p className="wish-card__description">{wish.description}</p>
          ) : (
            <p className="wish-card__description text-subtle">
              Une belle idée cadeau à conserver pour la prochaine occasion.
            </p>
          )}

          <div className="wish-card__specs">
            <div className="wish-card__spec-item">
              <span className="spec-label"><IconGift size={13} /> Occasion</span>
              <span className="spec-val">{wish.occasion?.name ?? "Occasion libre"}</span>
            </div>
            <div className="wish-card__spec-item">
              <span className="spec-label"><IconClock size={13} /> Ajouté</span>
              <span className="spec-val">{formatShortDate(wish.createdAt)}</span>
            </div>
          </div>

          {/* Souvenir si déjà offert */}
          {wish.giftHistory ? (
            <div className="wish-card__memory-box">
              <div className="memory-box__header">
                <IconHeart size={14} className="text-primary" />
                <strong>Souvenir : {wish.giftHistory.reaction ?? "Un moment magique"}</strong>
              </div>
              {wish.giftHistory.note ? (
                <p className="memory-box__note">« {wish.giftHistory.note} »</p>
              ) : null}
              <span className="memory-box__date">
                Offert le {formatShortDate(wish.giftHistory.giftedAt ?? wish.giftedAt)}
              </span>
            </div>
          ) : null}

          {showActions ? (
            <div className="wish-card__actions">
              <div className="wish-card__links-row">
                <Link href={`/wishes/${wish.id}`} className="card-detail-link">
                  Voir la fiche complète →
                </Link>
                {wish.productUrl ? (
                  <a
                    href={wish.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="card-ext-link"
                    title="Ouvrir la boutique"
                  >
                    <IconExternalLink size={15} /> Boutique
                  </a>
                ) : null}
              </div>

              {canGift && !isGifted ? (
                <div className="wish-card__cta-group">
                  {!isReserved ? (
                    <button
                      type="button"
                      className="btn-secondary btn-secondary--sm w-full"
                      onClick={() => setIsReserveModalOpen(true)}
                    >
                      <IconBookmark size={15} />
                      <span>Réserver en secret</span>
                    </button>
                  ) : (
                    <div className="reserved-status-pill">
                      <IconLock size={14} />
                      <span>Réservé en mode discret{wish.reservedByName ? ` par ${wish.reservedByName}` : ""}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-primary btn-primary--sm w-full"
                    onClick={() => setIsGiftModalOpen(true)}
                  >
                    <IconCheck size={15} />
                    <span>Marquer comme offert</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {renderModals()}
    </>
  );

  function renderModals() {
    return (
      <>
        {/* Modal Réserver */}
        {isReserveModalOpen ? (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isPending) {
                setIsReserveModalOpen(false);
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-card modal-card--sm">
              <div className="modal-card__header">
                <div className="modal-card__identity">
                  <div className="modal-card__icon-badge">
                    <IconBookmark size={18} />
                  </div>
                  <div>
                    <span className="modal-card__subtitle">Mode Discret</span>
                    <h2 className="modal-card__title">Réserver ce cadeau</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsReserveModalOpen(false)}
                  disabled={isPending}
                >
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleReserve} className="composer-form-inner">
                <p className="modal-body-text">
                  Tu t’apprêtes à réserver <strong>« {wish.title} »</strong>.
                  Ce cadeau sera marqué comme réservé pour éviter les doublons tout en gardant la surprise intacte.
                </p>

                <div className="modal-card__footer">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setIsReserveModalOpen(false)}
                    disabled={isPending}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isPending}
                  >
                    {isPending ? "Réservation en cours..." : "Confirmer la réservation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Modal Marquer comme Offert */}
        {isGiftModalOpen ? (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isPending) {
                setIsGiftModalOpen(false);
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-card">
              <div className="modal-card__header">
                <div className="modal-card__identity">
                  <div className="modal-card__icon-badge">
                    <IconHeart size={18} />
                  </div>
                  <div>
                    <span className="modal-card__subtitle">Mémoire du couple</span>
                    <h2 className="modal-card__title">Immortaliser ce cadeau</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsGiftModalOpen(false)}
                  disabled={isPending}
                >
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleGift} className="composer-form-inner">
                <p className="modal-body-text">
                  Félicitations ! Tu as offert <strong>« {wish.title} »</strong>.
                  Cette attention rejoindra l’historique de vos moments précieux.
                </p>

                <div className="form-field">
                  <label className="form-label">Sa réaction</label>
                  <div className="reaction-pills-cloud">
                    {reactionOptions.map((reac) => (
                      <button
                        key={reac}
                        type="button"
                        className={`reaction-pill ${selectedReaction === reac ? "is-active" : ""}`}
                        onClick={() => setSelectedReaction(reac)}
                        disabled={isPending}
                      >
                        {reac}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="gift-note" className="form-label">
                    Note ou souvenir personnel <span className="label-subtext">(optionnel)</span>
                  </label>
                  <textarea
                    id="gift-note"
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Ex: Offert pendant notre week-end en amoureux, elle a été surprise..."
                    className="form-textarea"
                    disabled={isPending}
                  />
                </div>

                <div className="modal-card__footer">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setIsGiftModalOpen(false)}
                    disabled={isPending}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isPending}
                  >
                    {isPending ? "Enregistrement..." : "Enregistrer dans les souvenirs"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Modal Supprimer */}
        {isDeleteModalOpen ? (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isPending) {
                setIsDeleteModalOpen(false);
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-card modal-card--sm">
              <div className="modal-card__header">
                <div className="modal-card__identity">
                  <div className="modal-card__icon-badge text-accent">
                    <IconTrash size={18} />
                  </div>
                  <div>
                    <span className="modal-card__subtitle">Suppression</span>
                    <h2 className="modal-card__title">Retirer cette envie ?</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isPending}
                >
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleDelete} className="composer-form-inner">
                <p className="modal-body-text">
                  Es-tu sûr(e) de vouloir supprimer définitivement <strong>« {wish.title} »</strong> de la liste ?
                </p>

                <div className="modal-card__footer">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isPending}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-danger"
                    disabled={isPending}
                  >
                    {isPending ? "Suppression..." : "Oui, supprimer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}
