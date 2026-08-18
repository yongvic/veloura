import Link from "next/link";
import { IconArrowLeft, IconGift, IconSparkle } from "@/components/icons";
import { StatusPill } from "@/components/status-pill";

export default function NotFound() {
  return (
    <div className="auth-screen">
      <div className="auth-card shell-panel">
        <StatusPill tone="gold" icon={<IconSparkle size={13} />}>
          Page introuvable
        </StatusPill>
        <h1 className="auth-title">Cette page n’existe plus.</h1>
        <p className="auth-lead">
          L’élément recherché a été déplacé ou n’est plus dans la liste. Tes autres envies sont toujours là.
        </p>
        <div className="auth-actions">
          <Link href="/wishes" className="btn-primary">
            <IconGift size={16} />
            <span>Retour aux envies</span>
          </Link>
          <Link href="/" className="btn-secondary">
            <IconArrowLeft size={16} />
            <span>Revenir à l’accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
