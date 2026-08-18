"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import {
  IconArrowLeft,
  IconBookmark,
  IconCalendar,
  IconClock,
  IconGift,
  IconHeart,
  IconPlus,
  IconSparkle,
  IconTag,
  IconUser
} from "@/components/icons";
import { WishComposerModal } from "@/components/wish-composer-modal";
import type { OccasionSummary } from "@/lib/types";

const navigationLinks = [
  { href: "/", label: "Accueil", icon: IconSparkle },
  { href: "/wishes", label: "Envies", icon: IconGift },
  { href: "/occasions", label: "Occasions", icon: IconCalendar },
  { href: "/preferences", label: "Préférences", icon: IconUser },
  { href: "/history", label: "Mémoire", icon: IconHeart }
];

export function AppShell({
  children,
  activePath,
  backHref,
  backLabel,
  occasions = [],
  demoMode = false
}: {
  children: ReactNode;
  activePath?: string;
  backHref?: string;
  backLabel?: string;
  occasions?: OccasionSummary[];
  demoMode?: boolean;
}) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="shell-root">
      {/* Top Header Navigation */}
      <header className="topbar shell-panel">
        <div className="topbar__identity">
          <Link href="/" className="brand-link" aria-label="Retour à l'accueil Veloura">
            <BrandMark size={42} />
            <div className="brand-text">
              <span className="brand-name">Veloura</span>
              <span className="brand-tagline">Écrin d'attentions</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
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

        {/* Header Right Action */}
        <div className="topbar__actions">
          <button
            type="button"
            className="btn-primary btn-primary--sm header-cta-btn"
            onClick={() => setIsComposerOpen(true)}
          >
            <IconPlus size={16} />
            <span>Ajouter une envie</span>
          </button>
        </div>
      </header>

      {/* Sub-Header / Back navigation bar if on detail page */}
      {backHref ? (
        <div className="subnav-bar">
          <Link href={backHref} className="subnav-back-link">
            <IconArrowLeft size={16} />
            <span>{backLabel ?? "Retour"}</span>
          </Link>
        </div>
      ) : null}

      {/* Main Page Frame */}
      <main className="page-frame" id="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
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

          {/* Central Floating Action Button */}
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

      {/* Global Quick Wish Composer Modal */}
      <WishComposerModal
        occasions={occasions}
        demoMode={demoMode}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </div>
  );
}
