"use client";

import { useActionState, useState } from "react";

import { createWish } from "@/app/actions";
import type { OccasionSummary } from "@/lib/types";

const priorities = [
  { value: "MUST_HAVE", label: "Je veux ca" },
  { value: "WOULD_LOVE", label: "Ca me ferait plaisir" },
  { value: "MAYBE_LATER", label: "Plus tard" },
  { value: "LUXURY", label: "Luxe" }
];

const categories = ["Mode", "Bijoux", "Beaute", "Maison", "Tech", "Surprise"];

type ComposerState = { error?: string; ok?: boolean } | null;

export function WishComposer({
  occasions,
  demoMode
}: {
  occasions: OccasionSummary[];
  demoMode: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: ComposerState, formData: FormData): Promise<ComposerState> => {
      const result = await createWish(formData);
      if (result?.ok) {
        setPreview(null);
      }
      return result;
    },
    null
  );

  return (
    <section className="composer shell-panel">
      <div className="composer__head">
        <div>
          <p className="eyebrow">Ajout rapide</p>
          <h2>Une envie se note en quelques secondes.</h2>
        </div>
        <p className="section-copy">
          Ajoute un titre, un budget en FCFA, une photo et une occasion. Le reste peut venir plus tard.
        </p>
      </div>
      <form action={formAction} className="composer__form">
        <label>
          <span>Titre du cadeau</span>
          <input name="title" placeholder="Mini sac, parfum, bijoux..." required />
        </label>
        <label>
          <span>Budget estime (FCFA)</span>
          <input name="priceFcfa" type="number" min="0" step="1000" placeholder="25000" />
        </label>
        <label>
          <span>Categorie</span>
          <select name="category" defaultValue="Mode">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Priorite</span>
          <select name="priority" defaultValue="WOULD_LOVE">
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Occasion</span>
          <select name="occasionId" defaultValue="">
            <option value="">Libre</option>
            {occasions.map((occasion) => (
              <option key={occasion.id} value={occasion.id}>
                {occasion.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Lien marchand</span>
          <input name="productUrl" type="url" placeholder="https://..." />
        </label>
        <label className="composer__full photo-field">
          <span>Photo du cadeau</span>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Apercu de la photo choisie" className="photo-preview" />
          ) : (
            <p className="demo-note">JPG, PNG, WEBP ou GIF, jusqu a 4,5 Mo. Stockee sur Vercel Blob.</p>
          )}
        </label>
        <label className="composer__full">
          <span>Ou un lien d image</span>
          <input name="imageUrl" type="url" placeholder="https://image..." />
        </label>
        <label className="composer__full">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Un detail utile: couleur, style, matiere, pourquoi cette envie..."
          />
        </label>
        <div className="composer__footer">
          <p className="demo-note">
            {state?.error
              ? state.error
              : demoMode
                ? "Mode demo actif. Connecte Neon et Prisma pour enregistrer les ajouts reellement."
                : "Les nouvelles envies et leurs photos seront visibles tout de suite."}
          </p>
          <button className="button" disabled={demoMode || pending}>
            {pending ? "Envoi en cours" : "Ajouter cette envie"}
          </button>
        </div>
      </form>
    </section>
  );
}
