import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/env";
import { InscriptionForm } from "@/components/inscription-form";

export default async function InscriptionPage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  let invitation: {
    email: string;
    inviterName: string;
    token: string;
    existingAccount: boolean;
  } | null = null;

  if (invite && hasDatabase()) {
    const found = await prisma.invitation.findUnique({
      where: { token: invite },
      include: { inviter: { select: { name: true } } }
    });
    if (found && found.status === "PENDING" && found.expiresAt > new Date()) {
      const existing = await prisma.user.findUnique({
        where: { email: found.email },
        select: { id: true }
      });
      invitation = {
        email: found.email,
        inviterName: found.inviter.name,
        token: found.token,
        existingAccount: Boolean(existing)
      };
    }
  }

  const loginHref = invitation ? `/connexion?invite=${invitation.token}` : "/connexion";

  return (
    <div className="auth-screen">
      <InscriptionForm invitation={invitation} />
      <p className="auth-switch auth-switch--outside">
        Déjà un compte ? <Link href={loginHref}>Se connecter</Link>
      </p>
    </div>
  );
}
