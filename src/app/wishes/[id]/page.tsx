import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { getDashboardData } from "@/lib/data";
import { formatFcfa, formatShortDate } from "@/lib/format";

export default async function WishDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDashboardData();
  const wish = [...data.activeWishes, ...data.reservedWishes, ...data.giftedWishes].find(
    (entry) => entry.id === id
  );

  if (!wish) {
    notFound();
  }

  return (
    <AppShell activePath="/wishes">
      <section className="page-hero shell-panel">
        <div className="budget-pills">
          <StatusPill tone="primary">{wish.category}</StatusPill>
          <StatusPill>{wish.occasion?.name ?? "Occasion libre"}</StatusPill>
          <StatusPill tone="accent">{formatFcfa(wish.priceFcfa)}</StatusPill>
        </div>
        <h2>{wish.title}</h2>
        <p className="section-copy">
          {wish.description ?? "Cette envie peut etre enrichie avec plus de contexte, un lien ou une image."}
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="shell-panel preference-card">
          <p className="eyebrow">Contexte</p>
          <p>Ajoute le {formatShortDate(wish.createdAt)}</p>
          <p>Priorite: {wish.priority}</p>
          <p>Statut: {wish.status}</p>
          {wish.productUrl ? (
            <Link href={wish.productUrl} target="_blank" className="ghost-link">
              Ouvrir le lien marchand
            </Link>
          ) : null}
        </article>

        <article className="shell-panel preference-card">
          <p className="eyebrow">Souvenir</p>
          <p>{wish.giftHistory?.note ?? "Pas encore de note associee a cette envie."}</p>
          <div className="chip-cloud">
            <StatusPill tone="success">{wish.giftHistory?.reaction ?? "En attente"}</StatusPill>
            <StatusPill>{formatShortDate(wish.giftHistory?.giftedAt ?? wish.giftedAt)}</StatusPill>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
