import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/env";
import { ConnexionForm } from "@/components/connexion-form";

export default async function ConnexionPage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  let invitation: { email: string; inviterName: string; token: string } | null = null;

  if (invite && hasDatabase()) {
    const found = await prisma.invitation.findUnique({
      where: { token: invite },
      include: { inviter: { select: { name: true } } }
    });
    if (found && found.status === "PENDING" && found.expiresAt > new Date()) {
      invitation = {
        email: found.email,
        inviterName: found.inviter.name,
        token: found.token
      };
    }
  }

  const signupHref = invitation ? `/inscription?invite=${invitation.token}` : "/inscription";

  return (
    <div className="auth-screen">
      <ConnexionForm invitation={invitation} />
      <p className="auth-switch auth-switch--outside">
        Pas encore de compte ? <Link href={signupHref}>Créer un espace</Link>
      </p>
    </div>
  );
}
