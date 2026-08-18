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
    try {
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
    } catch (error) {
      console.error("connexion invitation lookup", error);
    }
  }

  return (
    <div className="auth-screen">
      <ConnexionForm invitation={invitation} />
    </div>
  );
}
