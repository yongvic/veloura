"use client";

import { useState } from "react";
import { IconPlus, IconSparkle } from "@/components/icons";
import { WishComposerModal } from "@/components/wish-composer-modal";
import type { OccasionSummary } from "@/lib/types";

export function WishComposer({ occasions }: { occasions: OccasionSummary[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="composer-banner shell-panel">
        <div className="composer-banner__content">
          <div className="composer-banner__icon">
            <IconSparkle size={26} />
          </div>
          <div className="composer-banner__text">
            <span className="composer-banner__tag">Ajout rapide</span>
            <h3 className="composer-banner__title">Une idée en tête ? Note-la en quelques secondes</h3>
            <p className="composer-banner__desc">
              Titre, photo et occasion : ajoute l’envie pour qu’elle ne soit jamais oubliée.
            </p>
          </div>
        </div>
        <div className="composer-banner__action">
          <button type="button" className="btn-primary btn-primary--lg" onClick={() => setIsOpen(true)}>
            <IconPlus size={20} />
            <span>Ajouter une envie</span>
          </button>
        </div>
      </section>

      <WishComposerModal occasions={occasions} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
