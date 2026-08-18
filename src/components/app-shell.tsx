import Link from "next/link";
import { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { cx } from "@/components/cx";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/wishes", label: "Envies" },
  { href: "/history", label: "Offerts" },
  { href: "/occasions", label: "Occasions" },
  { href: "/preferences", label: "Preferences" }
];

export function AppShell({
  children,
  activePath
}: {
  children: ReactNode;
  activePath: string;
}) {
  return (
    <div className="shell">
      <header className="topbar shell-panel">
        <div className="topbar__identity">
          <BrandMark />
          <div>
            <p className="eyebrow">Veloura</p>
            <h1 className="topbar__title">Wishlist cadeaux, pensee comme un ecrin.</h1>
          </div>
        </div>
        <nav className="topbar__nav" aria-label="Navigation principale">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx("topbar__link", activePath === link.href && "is-active")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="page-frame">{children}</main>
    </div>
  );
}
