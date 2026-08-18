"use client";

import { useState } from "react";
import { acceptInviteFromSession } from "@/app/auth-actions";

export function RejoindreForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await acceptInviteFromSession(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="auth-form">
      {error ? (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      ) : null}
      <input type="hidden" name="inviteToken" value={token} />
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Lien en cours..." : "Accepter l’invitation"}
      </button>
    </form>
  );
}
