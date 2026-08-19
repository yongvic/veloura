"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createWish, updateWish } from "@/app/actions";
import { IconCheck, IconGift, IconPlus, IconSparkle, IconTag, IconX } from "@/components/icons";
import { useModalA11y } from "@/components/use-modal-a11y";
import { MAX_PRICE_FCFA, WISH_CATEGORIES } from "@/lib/validation";
import type { OccasionSummary, WishPriority, WishSummary } from "@/lib/types";

const priorityOptions: Array<{ value: WishPriority; label: string; desc: string }> = [
  { value: "MUST_HAVE", label: "Indispensable", desc: "La priorité absolue" },
  { value: "WOULD_LOVE", label: "Coup de cœur", desc: "Fera grand plaisir" },
  { value: "LUXURY", label: "Luxe & Rêve", desc: "Pièce d'exception" },
  { value: "MAYBE_LATER", label: "Plus tard", desc: "Idée pour l'avenir" }
];

type ComposerState = { error?: string; ok?: boolean } | null;

const MAX_FILE_SIZE_MB = 10;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Compression côté client avant upload : redimensionne à 1600px max et
 * réencode en JPEG 0.85. Les GIF (animés) passent tels quels.
 */
async function compressImageFile(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap === "undefined") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.type === "image/jpeg" && file.size < 600 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg"
    });
  } catch {
    return file;
  }
}

export function WishComposerModal({
  occasions,
  isOpen,
  onClose,
  initialOccasionId,
  wish
}: {
  occasions: OccasionSummary[];
  isOpen: boolean;
  onClose: () => void;
  initialOccasionId?: string;
  wish?: WishSummary;
}) {
  const isEdit = Boolean(wish);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const successTimerRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  function resetLocalState() {
    setPhotoPreview(null);
    setPhotoError(null);
    setSuccessToast(false);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeAndReset() {
    resetLocalState();
    onClose();
  }

  const [state, formAction, pending] = useActionState(
    async (_prev: ComposerState, formData: FormData): Promise<ComposerState> => {
      const action = isEdit ? updateWish : createWish;
      const result = await action(formData);
      if (result?.ok) {
        setSuccessToast(true);
        successTimerRef.current = window.setTimeout(() => {
          closeAndReset();
        }, 1200);
      }
      return result;
    },
    null
  );

  useModalA11y({
    isOpen,
    containerRef: dialogRef,
    onClose: closeAndReset,
    initialFocusRef: titleInputRef,
    canClose: !pending && !isCompressing
  });

  // Nettoyage du timer de succès et de l'URL de preview au démontage.
  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function clearPhotoSelection() {
    setPhotoPreview(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setPhotoError(`Image trop lourde (max ${MAX_FILE_SIZE_MB} Mo).`);
      event.target.value = "";
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file);
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      if (fileInputRef.current) {
        fileInputRef.current.files = transfer.files;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const url = URL.createObjectURL(compressed);
      previewUrlRef.current = url;
      setPhotoPreview(url);
    } catch {
      // La compression est un bonus : en cas d'échec, on envoie l'original.
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPhotoPreview(url);
    } finally {
      setIsCompressing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending && !isCompressing) closeAndReset();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-modal-title"
    >
      <div className="modal-card" ref={dialogRef} tabIndex={-1}>
        <div className="modal-card__header">
          <div className="modal-card__identity">
            <div className="modal-card__icon-badge">
              <IconSparkle size={18} />
            </div>
            <div>
              <span className="modal-card__subtitle">
                {isEdit ? "Ajuster l'envie" : "Nouvelle attention"}
              </span>
              <h2 id="composer-modal-title" className="modal-card__title">
                {isEdit ? "Modifier cette envie" : "Ajouter une envie"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closeAndReset}
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
            <h3>{isEdit ? "Envie mise à jour" : "Envie enregistrée"}</h3>
            <p>{isEdit ? "Les modifications sont visibles dans la liste." : "Elle apparaît maintenant dans la liste."}</p>
          </div>
        ) : (
          <form action={formAction} className="composer-form-inner">
            {state?.error ? (
              <div className="form-error-banner" role="alert">
                <span>{state.error}</span>
              </div>
            ) : null}

            {isEdit ? <input type="hidden" name="wishId" value={wish?.id} /> : null}

            <div className="form-field">
              <label htmlFor="wish-title" className="form-label">
                Titre de l’envie <span className="required-star">*</span>
              </label>
              <input
                id="wish-title"
                ref={titleInputRef}
                name="title"
                required
                maxLength={120}
                placeholder="Ex: Mini sac prune, Parfum fleur d'oranger..."
                className="form-input"
                disabled={pending}
                defaultValue={wish?.title}
              />
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="wish-category" className="form-label">
                  <IconTag size={15} /> Catégorie
                </label>
                <select
                  id="wish-category"
                  name="category"
                  defaultValue={wish?.category ?? "Mode"}
                  className="form-select"
                  disabled={pending}
                >
                  {WISH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="wish-priority" className="form-label">
                  <IconSparkle size={15} /> Niveau d’envie
                </label>
                <select
                  id="wish-priority"
                  name="priority"
                  defaultValue={wish?.priority ?? "WOULD_LOVE"}
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

            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="wish-occasion" className="form-label">
                  <IconGift size={15} /> Occasion liée
                </label>
                <select
                  id="wish-occasion"
                  name="occasionId"
                  defaultValue={wish?.occasion?.id ?? initialOccasionId ?? ""}
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
                <label htmlFor="wish-price" className="form-label">
                  Prix estimé (FCFA)
                </label>
                <input
                  id="wish-price"
                  name="priceFcfa"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_PRICE_FCFA}
                  step={100}
                  placeholder="Ex: 25000"
                  className="form-input"
                  disabled={pending}
                  defaultValue={wish?.priceFcfa ?? ""}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="wish-product-url" className="form-label">
                Lien boutique <span className="label-subtext">(optionnel)</span>
              </label>
              <input
                id="wish-product-url"
                name="productUrl"
                type="url"
                placeholder="https://..."
                maxLength={2000}
                className="form-input"
                disabled={pending}
                defaultValue={wish?.productUrl ?? ""}
              />
            </div>

            <div className="form-field photo-dropzone-block">
              <label className="form-label">
                Photo du cadeau{" "}
                <span className="label-subtext">
                  (max {MAX_FILE_SIZE_MB} Mo, compressée automatiquement)
                </span>
              </label>
              {isEdit && !photoPreview && wish?.imageUrl ? (
                <p className="photo-upload-hint">
                  La photo actuelle est conservée si tu n’en choisis pas une autre.
                </p>
              ) : null}
              {photoPreview ? (
                <div className="photo-preview-box">
                  {/* Preview local (URL objet) : next/image n'est pas utilisable ici */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Aperçu du cadeau" className="preview-img" />
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={clearPhotoSelection}
                    disabled={pending || isCompressing}
                  >
                    <IconX size={16} /> Changer de photo
                  </button>
                </div>
              ) : null}

              {/* La zone reste montée même quand l'aperçu s'affiche : démonter
                  l'input retirerait le fichier du formulaire à la soumission. */}
              <div className="photo-dropzone" hidden={Boolean(photoPreview)}>
                <input
                  ref={fileInputRef}
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="photo-file-input"
                  disabled={pending || isCompressing}
                  onChange={handlePhotoChange}
                />
                <div className="photo-dropzone-content">
                  <div className="photo-upload-icon">
                    <IconPlus size={20} />
                  </div>
                  <div>
                    <p className="photo-upload-main">
                      <strong>
                        {isCompressing ? "Optimisation de l'image..." : "Choisis une photo"}
                      </strong>{" "}
                      depuis l’appareil
                    </p>
                    <p className="photo-upload-hint">JPG, PNG, WEBP ou GIF</p>
                  </div>
                </div>
              </div>
              {photoError ? (
                <p className="form-error-banner" role="alert">
                  <span>{photoError}</span>
                </p>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="wish-description" className="form-label">
                Détails et précisions <span className="label-subtext">(couleur, taille, matière...)</span>
              </label>
              <textarea
                id="wish-description"
                name="description"
                rows={3}
                maxLength={2000}
                placeholder="Ex: Taille 38, couleur prune ou bordeaux, modèle en cuir lisse..."
                className="form-textarea"
                disabled={pending}
                defaultValue={wish?.description ?? ""}
              />
            </div>

            <div className="modal-card__footer">
              <button type="button" className="btn-ghost" onClick={closeAndReset} disabled={pending}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={pending || isCompressing}>
                {pending
                  ? "Enregistrement..."
                  : isEdit
                    ? "Enregistrer les modifications"
                    : "Enregistrer l'envie"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
