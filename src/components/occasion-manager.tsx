"use client";

import { useActionState, useState } from "react";
import { createOccasion, setOccasionDate } from "@/app/actions";
import { IconCalendar, IconCheck, IconPlus } from "@/components/icons";
import type { OccasionSummary } from "@/lib/types";

type FormState = { error?: string; ok?: boolean } | null;

function toDateInputValue(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function OccasionDateEditor({ occasion }: { occasion: OccasionSummary }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      return setOccasionDate(formData);
    },
    null
  );

  return (
    <form action={formAction} className="occasion-date-form">
      <input type="hidden" name="occasionId" value={occasion.id} />
      <label className="occasion-date-form__label" htmlFor={`date-${occasion.id}`}>
        <IconCalendar size={14} /> Date
      </label>
      <input
        id={`date-${occasion.id}`}
        type="date"
        name="eventDate"
        defaultValue={toDateInputValue(occasion.eventDate)}
        className="form-input occasion-date-form__input"
        disabled={pending}
      />
      <button type="submit" className="btn-secondary btn-secondary--sm" disabled={pending}>
        <IconCheck size={14} /> {pending ? "..." : "Enregistrer"}
      </button>
      {state?.error ? (
        <span className="occasion-date-form__error" role="alert">
          {state.error}
        </span>
      ) : null}
      {state?.ok ? (
        <span className="occasion-date-form__ok" role="status">
          Enregistré
        </span>
      ) : null}
    </form>
  );
}

export function OccasionCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createOccasion(formData);
      if (result?.ok) setIsOpen(false);
      return result;
    },
    null
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setIsOpen(true)}
      >
        <IconPlus size={16} /> Nouvelle occasion
      </button>
    );
  }

  return (
    <form action={formAction} className="occasion-create-form shell-panel">
      <div className="form-row-2">
        <div className="form-field">
          <label htmlFor="new-occasion-name" className="form-label">
            Nom de l’occasion <span className="required-star">*</span>
          </label>
          <input
            id="new-occasion-name"
            name="name"
            type="text"
            required
            maxLength={60}
            placeholder="Ex: Crémaillère, Fête des mères..."
            className="form-input"
            disabled={pending}
          />
        </div>
        <div className="form-field">
          <label htmlFor="new-occasion-date" className="form-label">
            Date <span className="label-subtext">(optionnel)</span>
          </label>
          <input
            id="new-occasion-date"
            name="eventDate"
            type="date"
            className="form-input"
            disabled={pending}
          />
        </div>
      </div>
      {state?.error ? (
        <div className="form-error-banner" role="alert">
          <span>{state.error}</span>
        </div>
      ) : null}
      <div className="occasion-create-form__actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setIsOpen(false)}
          disabled={pending}
        >
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Création..." : "Créer l’occasion"}
        </button>
      </div>
    </form>
  );
}
