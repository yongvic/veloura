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
    try {
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
    } catch (error) {
      console.error("inscription invitation lookup", error);
    }
  }

  return (
    <div className="auth-screen">
      <InscriptionForm invitation={invitation} />
    </div>
  );
}
