"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { savePreferences } from "@/app/actions";
import { IconCheck } from "@/components/icons";
import type { PreferenceSummary } from "@/lib/types";

type FormState = { error?: string; ok?: boolean } | null;

const fields: {
  key: keyof PreferenceSummary;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    key: "sizes",
    label: "Tailles & mensurations",
    hint: "Vêtements, chaussures, bagues",
    placeholder: "Ex: Haut 38, Chaussures 39, Bague 52"
  },
  {
    key: "favoriteColors",
    label: "Couleurs de prédilection",
    hint: "Teintes qui la subliment",
    placeholder: "Ex: Bordeaux, rose poudré, doré"
  },
  {
    key: "favoriteBrands",
    label: "Marques & boutiques chéries",
    hint: "Créateurs et enseignes favorites",
    placeholder: "Ex: Sézane, Zara, artisanat local"
  },
  {
    key: "favoriteStyles",
    label: "Styles & esthétiques",
    hint: "Coupes, matières, finitions",
    placeholder: "Ex: Minimaliste, cuir lisse, doré discret"
  },
  {
    key: "avoidNotes",
    label: "À éviter formellement",
    hint: "Fausses notes & allergies",
    placeholder: "Ex: Parfums entêtants, talons aiguilles"
  }
];

/**
 * Édition des goûts : une zone de texte par section, valeurs séparées
 * par des virgules ou des retours à la ligne.
 */
export function PreferencesForm({ preferences }: { preferences: PreferenceSummary | null }) {
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await savePreferences(formData);
      if (result?.ok) {
        setShowSaved(true);
        if (savedTimerRef.current !== null) {
          window.clearTimeout(savedTimerRef.current);
        }
        savedTimerRef.current = window.setTimeout(() => setShowSaved(false), 2500);
      }
      return result;
    },
    null
  );

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  return (
    <form action={formAction} className="preferences-edit-form shell-panel">
      <p className="preferences-edit-form__intro">
        Sépare chaque élément par une virgule ou un retour à la ligne. Ces précisions
        guident ton partenaire pour offrir juste.
      </p>

      <div className="preferences-edit-form__grid">
        {fields.map((field) => (
          <div key={field.key} className="form-field">
            <label htmlFor={`pref-${field.key}`} className="form-label">
              {field.label} <span className="label-subtext">({field.hint})</span>
            </label>
            <textarea
              id={`pref-${field.key}`}
              name={field.key}
              rows={3}
              className="form-textarea"
              placeholder={field.placeholder}
              defaultValue={(preferences?.[field.key] ?? []).join(", ")}
              disabled={pending}
            />
          </div>
        ))}
      </div>

      {state?.error ? (
        <div className="form-error-banner" role="alert">
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="preferences-edit-form__actions">
        {showSaved ? (
          <span className="preferences-edit-form__saved" role="status">
            <IconCheck size={14} /> Enregistré
          </span>
        ) : null}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer mes goûts"}
        </button>
      </div>
    </form>
  );
}
