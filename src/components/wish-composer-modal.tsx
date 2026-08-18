"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createWish } from "@/app/actions";
import {
  IconCheck,
  IconGift,
  IconPlus,
  IconSparkle,
  IconTag,
  IconX
} from "@/components/icons";
import type { OccasionSummary, WishPriority } from "@/lib/types";

const priorityOptions: Array<{ value: WishPriority; label: string; desc: string }> = [
  { value: "MUST_HAVE", label: "Indispensable", desc: "La priorité absolue" },
  { value: "WOULD_LOVE", label: "Coup de cœur", desc: "Fera grand plaisir" },
  { value: "LUXURY", label: "Luxe & Rêve", desc: "Pièce d'exception" },
  { value: "MAYBE_LATER", label: "Plus tard", desc: "Idée pour l'avenir" }
];

const categoryOptions = [
  "Mode",
  "Bijoux",
  "Beauté",
  "Maison",
  "Maroquinerie",
  "Voyage",
  "Tech",
  "Surprise"
];

const budgetPresets = [15000, 30000, 50000, 100000];

type ComposerState = { error?: string; ok?: boolean } | null;

export function WishComposerModal({
  occasions,
  demoMode,
  isOpen,
  onClose,
  initialOccasionId
}: {
  occasions: OccasionSummary[];
  demoMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  initialOccasionId?: string;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [customBudget, setCustomBudget] = useState<string>("");
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: ComposerState, formData: FormData): Promise<ComposerState> => {
      // If a preset budget was chosen and not overwritten in text
      if (selectedBudget && !formData.get("priceFcfa")) {
        formData.set("priceFcfa", String(selectedBudget));
      }
      const result = await createWish(formData);
      if (result?.ok) {
        setPhotoPreview(null);
        setSelectedBudget(null);
        setCustomBudget("");
        setSuccessToast(true);
        setTimeout(() => {
          setSuccessToast(false);
          onClose();
        }, 1200);
      }
      return result;
    },
    null
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !pending) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, pending]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-modal-title"
    >
      <div className="modal-card">
        <div className="modal-card__header">
          <div className="modal-card__identity">
            <div className="modal-card__icon-badge">
              <IconSparkle size={18} />
            </div>
            <div>
              <span className="modal-card__subtitle">Nouvelle attention</span>
              <h2 id="composer-modal-title" className="modal-card__title">
                Ajouter une envie
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={pending}
            aria-label="Fermer la fenêtre"
          >
            <IconX size={18} />
          </button>
        </div>

        {successToast ? (
          <div className="composer-success-banner">
            <div className="composer-success-banner__icon">
              <IconCheck size={24} />
            </div>
            <h3>Envie enregistrée avec succès</h3>
            <p>Elle a été ajoutée à la liste et s'affiche immédiatement.</p>
          </div>
        ) : (
          <form action={formAction} className="composer-form-inner">
            {state?.error ? (
              <div className="form-error-banner" role="alert">
                <span>{state.error}</span>
              </div>
            ) : null}

            {demoMode ? (
              <div className="demo-notice-bar">
                <span>Mode démonstration : les ajouts sont simulés localement.</span>
              </div>
            ) : null}

            {/* Titre */}
            <div className="form-field">
              <label htmlFor="wish-title" className="form-label">
                Titre de l'envie <span className="required-star">*</span>
              </label>
              <input
                id="wish-title"
                ref={titleInputRef}
                name="title"
                required
                placeholder="Ex: Mini sac prune, Parfum fleur d'oranger..."
                className="form-input text-lg"
                disabled={pending}
              />
            </div>

            {/* Catégorie & Priorité */}
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="wish-category" className="form-label">
                  <IconTag size={15} /> Catégorie
                </label>
                <select
                  id="wish-category"
                  name="category"
                  defaultValue="Mode"
                  className="form-select"
                  disabled={pending}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="wish-priority" className="form-label">
                  <IconSparkle size={15} /> Niveau d'envie
                </label>
                <select
                  id="wish-priority"
                  name="priority"
                  defaultValue="WOULD_LOVE"
                  className="form-select"
                  disabled={pending}
                >
                  {priorityOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} - {p.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget en FCFA */}
            <div className="form-field">
              <label className="form-label">
                Budget estimé en FCFA <span className="label-subtext">(optionnel)</span>
              </label>
              <div className="budget-preset-pills">
                {budgetPresets.map((amount) => {
                  const isSelected = selectedBudget === amount && !customBudget;
                  return (
                    <button
                      key={amount}
                      type="button"
                      className={`preset-pill ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setSelectedBudget(amount);
                        setCustomBudget(String(amount));
                      }}
                      disabled={pending}
                    >
                      {new Intl.NumberFormat("fr-FR").format(amount)} FCFA
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                name="priceFcfa"
                min="0"
                step="1000"
                value={customBudget}
                onChange={(e) => {
                  setCustomBudget(e.target.value);
                  setSelectedBudget(null);
                }}
                placeholder="Ou saisis un montant précis (ex: 45000)"
                className="form-input"
                disabled={pending}
              />
            </div>

            {/* Occasion & Lien marchand */}
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="wish-occasion" className="form-label">
                  <IconGift size={15} /> Occasion liée
                </label>
                <select
                  id="wish-occasion"
                  name="occasionId"
                  defaultValue={initialOccasionId ?? ""}
                  className="form-select"
                  disabled={pending}
                >
                  <option value="">Occasion libre / Tout moment</option>
                  {occasions.map((occ) => (
                    <option key={occ.id} value={occ.id}>
                      {occ.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="wish-product-url" className="form-label">
                  Lien marchand ou boutique
                </label>
                <input
                  id="wish-product-url"
                  name="productUrl"
                  type="url"
                  placeholder="https://..."
                  className="form-input"
                  disabled={pending}
                />
              </div>
            </div>

            {/* Photo Upload ou URL */}
            <div className="form-field photo-dropzone-block">
              <label className="form-label">Photo du cadeau</label>
              {photoPreview ? (
                <div className="photo-preview-box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Aperçu du cadeau" className="preview-img" />
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={() => {
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={pending}
                  >
                    <IconX size={16} /> Changer de photo
                  </button>
                </div>
              ) : (
                <div className="photo-dropzone">
                  <input
                    ref={fileInputRef}
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="photo-file-input"
                    disabled={pending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div className="photo-dropzone-content">
                    <div className="photo-upload-icon">
                      <IconPlus size={20} />
                    </div>
                    <div>
                      <p className="photo-upload-main">
                        <strong>Sélectionne une photo</strong> ou glisse un fichier ici
                      </p>
                      <p className="photo-upload-hint">JPG, PNG, WEBP jusqu'à 4.5 Mo</p>
                    </div>
                  </div>
                </div>
              )}

              <input
                name="imageUrl"
                type="url"
                placeholder="Ou colle directement l'URL d'une image en ligne"
                className="form-input mt-2"
                disabled={pending}
              />
            </div>

            {/* Description / Précisions */}
            <div className="form-field">
              <label htmlFor="wish-description" className="form-label">
                Détails et précisions <span className="label-subtext">(couleur, taille, matière...)</span>
              </label>
              <textarea
                id="wish-description"
                name="description"
                rows={3}
                placeholder="Ex: Taille 38, couleur prune ou bordeaux, modèle en cuir lisse..."
                className="form-textarea"
                disabled={pending}
              />
            </div>

            {/* Footer actions */}
            <div className="modal-card__footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
                disabled={pending}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={pending}
              >
                {pending ? (
                  <span className="btn-spinner-content">
                    <span className="spinner-dot" /> Enregistrement...
                  </span>
                ) : (
                  <>
                    <IconPlus size={18} /> Enregistrer l'envie
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
