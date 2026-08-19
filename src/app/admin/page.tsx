import { signOut } from "@/app/auth-actions";
import { AdminUserActions } from "@/components/admin-user-actions";
import { BrandMark } from "@/components/brand-mark";
import { IconLogOut } from "@/components/icons";
import { LocalDate } from "@/components/local-date";
import { StatusPill } from "@/components/status-pill";
import { requireAdmin } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await requireAdmin();

  const [users, wishes, invitations, pairs] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        partnerId: true,
        createdAt: true,
        partner: { select: { name: true, email: true } },
        _count: { select: { wishes: true } }
      }
    }),
    prisma.wish.count(),
    prisma.invitation.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { partnerId: { not: null }, role: "RECIPIENT" } })
  ]);

  return (
    <div className="admin-root">
      <header className="admin-topbar">
        <div className="auth-brand">
          <BrandMark size={36} />
          <div>
            <p className="auth-kicker">Espace admin</p>
            <h1 className="admin-title">Veloura</h1>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn-secondary btn-secondary--sm">
            <IconLogOut size={16} /> {session.name}
          </button>
        </form>
      </header>

      <section className="admin-stats">
        <article className="admin-stat">
          <strong>{users.filter((u) => u.role !== "ADMIN").length}</strong>
          <span>Comptes</span>
        </article>
        <article className="admin-stat">
          <strong>{pairs}</strong>
          <span>Couples liés</span>
        </article>
        <article className="admin-stat">
          <strong>{wishes}</strong>
          <span>Envies</span>
        </article>
        <article className="admin-stat">
          <strong>{invitations}</strong>
          <span>Invitations en attente</span>
        </article>
      </section>

      <section className="admin-table-wrap shell-panel">
        <h2>Comptes</h2>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Personne</th>
                <th>Rôle</th>
                <th>Lié à</th>
                <th>Envies</th>
                <th>Depuis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <div className="admin-email">{user.email}</div>
                  </td>
                  <td>
                    <StatusPill size="sm" tone={user.role === "ADMIN" ? "gold" : "primary"}>
                      {user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "RECIPIENT"
                          ? "Envies"
                          : "Offre"}
                    </StatusPill>
                  </td>
                  <td>{user.partner ? `${user.partner.name}` : "—"}</td>
                  <td>{user._count.wishes}</td>
                  <td><LocalDate value={user.createdAt} /></td>
                  <td className="admin-row-actions">
                    {user.role !== "ADMIN" ? (
                      <AdminUserActions
                        userId={user.id}
                        userName={user.name}
                        hasPartner={Boolean(user.partnerId)}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
