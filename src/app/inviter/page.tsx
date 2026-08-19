import { BrandMark } from "@/components/brand-mark";
import { InviteForm } from "@/components/invite-form";
import { signOut } from "@/app/auth-actions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guard";
import { redirect } from "next/navigation";

export default async function InviterPage() {
  const session = await requireUser();
  if (session.role === "ADMIN") redirect("/admin");

  let me = null;
  try {
    me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        partnerId: true,
        invitationsSent: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
  } catch (error) {
    console.error("inviter lookup", error);
  }

  if (me?.partnerId) redirect("/");

  const pendingInvite = me?.invitationsSent[0];

  return (
    <div className="auth-screen">
      <div className="auth-card shell-panel">
        <div className="auth-brand">
          <BrandMark size={48} />
          <div>
            <p className="auth-kicker">Un espace à deux</p>
            <h1 className="auth-title">Invite l’autre personne</h1>
          </div>
        </div>
        <p className="auth-lead">
          Veloura relie deux comptes. Indique son e-mail pour générer un lien d’invitation,
          puis transmets-le-lui toi-même (message, WhatsApp…). Tant que l’invitation n’est
          pas acceptée, la liste reste privée.
        </p>

        <InviteForm defaultEmail={pendingInvite?.email} />

        <form action={signOut} className="auth-signout">
          <button type="submit" className="btn-ghost">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
