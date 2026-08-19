"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  clearSessionCookie,
  complementaryRole,
  createInviteToken,
  getSession,
  hashPassword,
  isAppRole,
  setSessionCookie,
  verifyPassword,
  type SessionUser
} from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { ensureAdminUser, ensureDefaultOccasions } from "@/lib/guard";

type AuthState = { error?: string; ok?: boolean; inviteUrl?: string } | null;

class InviteError extends Error {}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function sessionFromUser(user: {
  id: string;
  email: string;
  name: string;
  role: SessionUser["role"];
}): SessionUser {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

async function originFromRequest() {
  if (process.env.APP_ORIGIN) {
    return process.env.APP_ORIGIN.replace(/\/$/, "");
  }
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) return "";
  return `${proto}://${host}`;
}

/**
 * Bootstrap admin limité au seul login du compte admin : aucun coût pour
 * les autres utilisateurs, et l'admin se répare tout seul si le boot a
 * échoué. La rotation de ADMIN_PASSWORD est appliquée à ce moment-là.
 */
async function ensureAdminIfRelevant(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || email !== adminEmail) return;
  try {
    await ensureAdminUser();
  } catch (error) {
    console.error("ensureAdminUser", error);
  }
}

async function acceptInvitationForUser(params: {
  token: string;
  user: { id: string; email: string; partnerId: string | null };
}) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: { inviter: true }
  });

  if (!invitation || invitation.status !== "PENDING") {
    return { error: "Cette invitation n'est plus valable." };
  }
  if (invitation.expiresAt < new Date()) {
    return { error: "Cette invitation a expiré. Demande un nouveau lien." };
  }
  if (invitation.email !== params.user.email) {
    return { error: `Cette invitation est destinée à ${invitation.email}.` };
  }
  if (invitation.inviterId === params.user.id) {
    return { error: "Tu ne peux pas accepter ta propre invitation." };
  }
  if (!isAppRole(invitation.inviter.role)) {
    return { error: "Cette invitation n'est pas utilisable." };
  }
  if (params.user.partnerId || invitation.inviter.partnerId) {
    return { error: "L'un des deux comptes est déjà lié." };
  }

  const role = complementaryRole(invitation.inviter.role);

  try {
    await prisma.$transaction(async (tx) => {
      // Revendication atomique de l'invitation : un double envoi ou deux
      // onglets ne peuvent pas accepter deux fois.
      const claimed = await tx.invitation.updateMany({
        where: { id: invitation.id, status: "PENDING" },
        data: { status: "ACCEPTED", acceptedAt: new Date() }
      });
      if (claimed.count === 0) {
        throw new InviteError("Cette invitation n'est plus valable.");
      }

      const [meFresh, inviterFresh] = await Promise.all([
        tx.user.findUnique({
          where: { id: params.user.id },
          select: { partnerId: true }
        }),
        tx.user.findUnique({
          where: { id: invitation.inviterId },
          select: { partnerId: true }
        })
      ]);
      if (!meFresh || !inviterFresh) {
        throw new InviteError("Compte introuvable.");
      }
      if (meFresh.partnerId || inviterFresh.partnerId) {
        throw new InviteError("L'un des deux comptes est déjà lié.");
      }

      // La prise du partnerId de l'inviter est conditionnelle : si un lien
      // concurrent s'est établi entre-temps, updateMany ne matche plus et
      // la transaction avorte au lieu d'écraser le lien existant.
      const inviterLinked = await tx.user.updateMany({
        where: { id: invitation.inviterId, partnerId: null },
        data: { partnerId: params.user.id }
      });
      if (inviterLinked.count === 0) {
        throw new InviteError("L'un des deux comptes est déjà lié.");
      }
      await tx.user.update({
        where: { id: params.user.id },
        data: { partnerId: invitation.inviterId, role }
      });
    });
  } catch (error) {
    if (error instanceof InviteError) {
      return { error: error.message };
    }
    console.error("acceptInvitation", error);
    return { error: "Impossible de lier les comptes. Réessaie." };
  }

  const recipientId = role === "RECIPIENT" ? params.user.id : invitation.inviterId;
  await ensureDefaultOccasions(recipientId);

  const linked = await prisma.user.findUniqueOrThrow({
    where: { id: params.user.id },
    select: { id: true, email: true, name: true, role: true }
  });

  return { ok: true as const, user: linked };
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();
  const requestedRole = String(formData.get("role") ?? "RECIPIENT");

  if (!name || name.length < 2) {
    return { error: "Indique ton prénom." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Indique une adresse e-mail valide." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const rateLimited = checkRateLimit({
    key: `signup:${email}`,
    limit: 8,
    windowMs: 60 * 60 * 1000
  });
  if (!rateLimited.allowed) {
    return { error: "Trop de tentatives. Réessaie dans une heure." };
  }

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Impossible de joindre la base. Réessaie dans un instant." };
  }

  if (existing) {
    return {
      error: inviteToken
        ? "Tu as déjà un compte. Connecte-toi avec ce même lien pour rejoindre l'espace."
        : "Un compte existe déjà avec cet e-mail. Connecte-toi."
    };
  }

  if (inviteToken) {
    const invitation = await prisma.invitation.findUnique({
      where: { token: inviteToken },
      include: { inviter: true }
    });

    if (!invitation || invitation.status !== "PENDING") {
      return { error: "Cette invitation n'est plus valable." };
    }
    if (invitation.expiresAt < new Date()) {
      return { error: "Cette invitation a expiré. Demande un nouveau lien." };
    }
    if (invitation.email !== email) {
      return { error: `Cette invitation est destinée à ${invitation.email}.` };
    }
    if (!isAppRole(invitation.inviter.role)) {
      return { error: "Cette invitation n'est pas utilisable." };
    }

    const role = complementaryRole(invitation.inviter.role);
    let user;
    try {
      user = await prisma.$transaction(async (tx) => {
        const claimed = await tx.invitation.updateMany({
          where: { id: invitation.id, status: "PENDING" },
          data: { status: "ACCEPTED", acceptedAt: new Date() }
        });
        if (claimed.count === 0) {
          throw new InviteError("Cette invitation n'est plus valable.");
        }

        const created = await tx.user.create({
          data: {
            name,
            email,
            passwordHash: await hashPassword(password),
            role,
            partnerId: invitation.inviterId
          }
        });

        const inviterLinked = await tx.user.updateMany({
          where: { id: invitation.inviterId, partnerId: null },
          data: { partnerId: created.id }
        });
        if (inviterLinked.count === 0) {
          throw new InviteError("Ce compte est déjà lié à quelqu'un d'autre.");
        }

        return created;
      });
    } catch (error) {
      if (error instanceof InviteError) {
        return { error: error.message };
      }
      console.error("signUp invite", error);
      return { error: "Impossible de rejoindre l'espace. Réessaie." };
    }

    const recipientId = user.role === "RECIPIENT" ? user.id : invitation.inviterId;
    await ensureDefaultOccasions(recipientId);
    await setSessionCookie(sessionFromUser(user));
    redirect("/");
  }

  if (requestedRole !== "RECIPIENT" && requestedRole !== "GIFTER") {
    return { error: "Choisis si tu notes les envies ou si tu offres." };
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: requestedRole
      }
    });
  } catch {
    return { error: "Impossible de créer le compte. Réessaie." };
  }

  if (user.role === "RECIPIENT") {
    await ensureDefaultOccasions(user.id);
  }

  await setSessionCookie(sessionFromUser(user));
  redirect("/inviter");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();

  if (!email || !password) {
    return { error: "Indique ton e-mail et ton mot de passe." };
  }

  const rateLimited = checkRateLimit({
    key: `signin:${email}`,
    limit: 10,
    windowMs: 10 * 60 * 1000
  });
  if (!rateLimited.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimited.retryAfterSeconds / 60));
    return { error: `Trop de tentatives. Réessaie dans ${minutes} min.` };
  }

  await ensureAdminIfRelevant(email);

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Impossible de joindre la base. Réessaie dans un instant." };
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  if (inviteToken && user.role !== "ADMIN") {
    const accepted = await acceptInvitationForUser({
      token: inviteToken,
      user: { id: user.id, email: user.email, partnerId: user.partnerId }
    });
    if ("error" in accepted) {
      return { error: accepted.error };
    }
    await setSessionCookie(sessionFromUser(accepted.user));
    redirect("/");
  }

  await setSessionCookie(sessionFromUser(user));
  if (user.role === "ADMIN") {
    redirect("/admin");
  }
  if (!user.partnerId) {
    redirect("/inviter");
  }
  redirect("/");
}

export async function acceptInviteFromSession(formData: FormData): Promise<AuthState> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const session = await getSession();
  if (!session) {
    return { error: "Connecte-toi pour accepter l'invitation." };
  }
  if (session.role === "ADMIN") {
    return { error: "L'espace admin ne peut pas être lié à un couple." };
  }

  const token = String(formData.get("inviteToken") ?? "").trim();
  if (!token) {
    return { error: "Lien d'invitation incomplet." };
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, partnerId: true }
  });
  if (!me) {
    return { error: "Compte introuvable." };
  }

  const accepted = await acceptInvitationForUser({
    token,
    user: me
  });
  if ("error" in accepted) {
    return { error: accepted.error };
  }
  await setSessionCookie(sessionFromUser(accepted.user));
  redirect("/");
}

export async function signOut() {
  await clearSessionCookie();
  redirect("/connexion");
}

export async function createInvitation(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const session = await getSession();
  if (!session) {
    return { error: "Connecte-toi pour envoyer une invitation." };
  }
  if (session.role === "ADMIN") {
    return { error: "L'espace admin n'envoie pas d'invitation de couple." };
  }

  const email = normalizeEmail(formData.get("email"));
  if (!email || !email.includes("@")) {
    return { error: "Indique l'e-mail de la personne à inviter." };
  }
  if (email === session.email) {
    return { error: "Tu ne peux pas t'inviter toi-même." };
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, partnerId: true, name: true }
  });
  if (!me) return { error: "Compte introuvable." };
  if (me.partnerId) {
    return { error: "Tu es déjà lié(e) à quelqu'un." };
  }

  const alreadyUser = await prisma.user.findUnique({ where: { email } });
  if (alreadyUser?.partnerId) {
    return { error: "Cette personne est déjà liée à un compte." };
  }

  await prisma.invitation.updateMany({
    where: { inviterId: me.id, status: "PENDING" },
    data: { status: "CANCELLED" }
  });

  const invitation = await prisma.invitation.create({
    data: {
      token: createInviteToken(),
      inviterId: me.id,
      email,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  const origin = await originFromRequest();
  const inviteUrl = `${origin}/inscription?invite=${invitation.token}`;

  revalidatePath("/inviter");
  return { ok: true, inviteUrl };
}

export async function cancelInvitation(formData: FormData) {
  if (!hasDatabase()) return;

  const session = await getSession();
  if (!session) redirect("/connexion");

  const id = String(formData.get("invitationId") ?? "");
  if (!id) return;

  await prisma.invitation.updateMany({
    where: { id, inviterId: session.userId, status: "PENDING" },
    data: { status: "CANCELLED" }
  });

  revalidatePath("/inviter");
}
