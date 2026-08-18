import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell activePath="/wishes">
      <section className="page-hero shell-panel">
        <p className="eyebrow">Introuvable</p>
        <h2>Cette envie est introuvable, ou elle a deja quitte la liste.</h2>
        <p className="section-copy">
          Reviens a la wishlist pour retrouver les idees actives, les cadeaux reserves et les souvenirs deja offerts.
        </p>
        <div className="budget-pills">
          <Link href="/wishes" className="button">
            Retour aux envies
          </Link>
          <Link href="/" className="button button--secondary">
            Ouvrir le dashboard
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
