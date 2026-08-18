import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { IconArrowLeft, IconGift, IconSparkle } from "@/components/icons";
import { StatusPill } from "@/components/status-pill";

export default function NotFound() {
  return (
    <AppShell activePath="/wishes">
      <div className="not-found-container shell-panel">
        <StatusPill tone="gold" icon={<IconSparkle size={13} />}>
          Page introuvable
        </StatusPill>
        <h1 className="not-found-title">
          Cette envie ou cette page est introuvable.
        </h1>
        <p className="not-found-desc">
          L'élément recherché n'existe plus ou a été déplacé. Pas d'inquiétude,
          toutes les autres envies et souvenirs sont bien conservés dans votre écrin.
        </p>

        <div className="not-found-actions">
          <Link href="/wishes" className="btn-primary">
            <IconGift size={16} />
            <span>Retour aux envies</span>
          </Link>
          <Link href="/" className="btn-secondary">
            <IconArrowLeft size={16} />
            <span>Revenir à l'accueil</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
