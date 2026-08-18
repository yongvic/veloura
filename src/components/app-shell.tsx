"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { signOut } from "@/app/auth-actions";
import { BrandMark } from "@/components/brand-mark";
import {
  IconArrowLeft,
  IconCalendar,
  IconGift,
  IconHeart,
  IconLogOut,
  IconPlus,
  IconSparkle,
  IconUser
} from "@/components/icons";
import { WishComposerModal } from "@/components/wish-composer-modal";
import type { AppRole, OccasionSummary } from "@/lib/types";

const navigationLinks = [
  { href: "/", label: "Accueil", icon: IconSparkle },
  { href: "/wishes", label: "Envies", icon: IconGift },
  { href: "/occasions", label: "Occasions", icon: IconCalendar },
  { href: "/preferences", label: "Goûts", icon: IconUser },
  { href: "/history", label: "Mémoire", icon: IconHeart }
];

export function AppShell({
  children,
  activePath,
  backHref,
  backLabel,
  occasions = [],
  userName
}: {
  children: ReactNode;
  activePath?: string;
  backHref?: string;
  backLabel?: string;
  occasions?: OccasionSummary[];
  userName: string;
  currentRole: AppRole;
}) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="shell-root">
      <header className="topbar shell-panel">
        <div className="topbar__identity">
          <Link href="/" className="brand-link" aria-label="Retour à l'accueil Veloura">
            <BrandMark size={36} />
            <div className="brand-text">
              <span className="brand-name">Veloura</span>
              <span className="brand-tagline">{userName}</span>
            </div>
          </Link>
        </div>

        <nav className="topbar__nav" aria-label="Navigation principale">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`topbar__link ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="topbar__actions">
          <button
            type="button"
            className="btn-primary btn-primary--sm header-cta-btn"
            onClick={() => setIsComposerOpen(true)}
          >
            <IconPlus size={16} />
            <span>Ajouter</span>
          </button>
          <form action={signOut}>
            <button type="submit" className="icon-logout-btn" aria-label="Se déconnecter">
              <IconLogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      {backHref ? (
        <div className="subnav-bar">
          <Link href={backHref} className="subnav-back-link">
            <IconArrowLeft size={16} />
            <span>{backLabel ?? "Retour"}</span>
          </Link>
        </div>
      ) : null}

      <main className="page-frame" id="main-content">
        {children}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <div className="mobile-bottom-nav__container">
          {navigationLinks.slice(0, 2).map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                <span className="mobile-nav-item__label">{link.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className="mobile-fab-btn"
            onClick={() => setIsComposerOpen(true)}
            aria-label="Ajouter une nouvelle envie"
          >
            <IconPlus size={22} />
          </button>

          {navigationLinks.slice(2).map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                <span className="mobile-nav-item__label">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <WishComposerModal
        occasions={occasions}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </div>
  );
}
