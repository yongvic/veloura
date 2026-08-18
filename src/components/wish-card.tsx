import Image from "next/image";
import Link from "next/link";

import { markGifted, reserveWish } from "@/app/actions";
import { formatFcfa, formatShortDate } from "@/lib/format";
import type { WishSummary } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

const priorityLabel: Record<WishSummary["priority"], string> = {
  MUST_HAVE: "Je veux ca",
  WOULD_LOVE: "Ca me ferait plaisir",
  MAYBE_LATER: "Plus tard",
  LUXURY: "Luxe"
};

export function WishCard({
  wish,
  demoMode,
  compact = false
}: {
  wish: WishSummary;
  demoMode: boolean;
  compact?: boolean;
}) {
  const isGifted = wish.status === "GIFTED";
  const isReserved = wish.status === "RESERVED";

  async function reserveWishAction(formData: FormData) {
    "use server";
    await reserveWish(formData);
  }

  async function markGiftedAction(formData: FormData) {
    "use server";
    await markGifted(formData);
  }

  return (
    <article className={`wish-card ${compact ? "wish-card--compact" : ""}`}>
      <div className="wish-card__media">
        {wish.imageUrl ? (
          <Image src={wish.imageUrl} alt={wish.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="wish-card__placeholder" />
        )}
      </div>
      <div className="wish-card__body">
        <div className="wish-card__meta">
          <StatusPill tone="primary">{priorityLabel[wish.priority]}</StatusPill>
          <StatusPill tone={isGifted ? "success" : isReserved ? "accent" : "neutral"}>
            {isGifted ? "Deja offert" : isReserved ? "Reserve" : wish.category}
          </StatusPill>
        </div>
        <div className="wish-card__content">
          <div>
            <h3>
              <Link href={`/wishes/${wish.id}`}>{wish.title}</Link>
            </h3>
            <p>{wish.description ?? "Une envie a garder sous la main pour une prochaine occasion."}</p>
          </div>
          <dl className="wish-card__facts">
            <div>
              <dt>Budget</dt>
              <dd>{formatFcfa(wish.priceFcfa)}</dd>
            </div>
            <div>
              <dt>Occasion</dt>
              <dd>{wish.occasion?.name ?? "Libre"}</dd>
            </div>
            <div>
              <dt>Ajoute le</dt>
              <dd>{formatShortDate(wish.createdAt)}</dd>
            </div>
          </dl>
          {wish.giftHistory ? (
            <div className="memory-note">
              <p>{wish.giftHistory.note ?? "Ce cadeau a deja marque un beau moment."}</p>
              <small>
                {wish.giftHistory.reaction ?? "Tres aime"} · {formatShortDate(wish.giftHistory.giftedAt)}
              </small>
            </div>
          ) : null}
        </div>
        <div className="wish-card__actions">
          {wish.productUrl ? (
            <a href={wish.productUrl} target="_blank" rel="noreferrer" className="ghost-link">
              Voir le lien
            </a>
          ) : null}

          {!isGifted ? (
            <div className="wish-card__forms">
              {!isReserved ? (
                <form action={reserveWishAction}>
                  <input type="hidden" name="wishId" value={wish.id} />
                  <button className="button button--secondary" disabled={demoMode}>
                    Reserver en discret
                  </button>
                </form>
              ) : (
                <p className="reserved-copy">Mode discret actif{wish.reservedByName ? ` par ${wish.reservedByName}` : ""}.</p>
              )}

              <form action={markGiftedAction} className="gift-form">
                <input type="hidden" name="wishId" value={wish.id} />
                <input type="hidden" name="reaction" value="A adore" />
                <button className="button" disabled={demoMode}>
                  Marquer comme offert
                </button>
              </form>
            </div>
          ) : (
            <p className="reserved-copy">Offert le {formatShortDate(wish.giftedAt)}.</p>
          )}
        </div>
      </div>
    </article>
  );
}
