import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { RejoindreForm } from "@/components/rejoindre-form";
import { requireUser } from "@/lib/guard";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function RejoindrePage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await requireUser();
  if (session.role === "ADMIN") redirect("/admin");

  const { invite } = await searchParams;
  if (!invite) redirect("/inviter");

  let me = null;
  try {
    me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { partnerId: true, email: true }
    });
  } catch (lookupError) {
    console.error("rejoindre user lookup", lookupError);
  }
  if (me?.partnerId) redirect("/");

  let invitation: { email: string; inviterName: string } | null = null;
  let error: string | null = null;

  if (hasDatabase()) {
    try {
      const found = await prisma.invitation.findUnique({
        where: { token: invite },
        include: { inviter: { select: { name: true } } }
      });
      if (!found || found.status !== "PENDING" || found.expiresAt < new Date()) {
        error = "Cette invitation n’est plus valable.";
      } else if (found.email !== session.email) {
        error = `Cette invitation est destinée à ${found.email}. Connecte-toi avec cet e-mail.`;
      } else {
        invitation = { email: found.email, inviterName: found.inviter.name };
      }
    } catch (lookupError) {
      console.error("rejoindre invitation lookup", lookupError);
      error = "Impossible de vérifier l’invitation pour le moment.";
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card shell-panel">
        <div className="auth-brand">
          <BrandMark size={48} />
          <div>
            <p className="auth-kicker">Invitation</p>
            <h1 className="auth-title">Relier vos comptes</h1>
          </div>
        </div>

        {error ? (
          <>
            <p className="auth-lead">{error}</p>
            <Link href="/inviter" className="btn-primary w-full">
              Retour
            </Link>
          </>
        ) : invitation ? (
          <>
            <p className="auth-lead">
              {invitation.inviterName} t’invite à partager l’espace Veloura. Tes deux comptes
              seront liés.
            </p>
            <RejoindreForm token={invite} />
          </>
        ) : (
          <p className="auth-lead">Invitation introuvable.</p>
        )}
      </div>
    </div>
  );
}
