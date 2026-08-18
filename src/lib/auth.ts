import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const scrypt = promisify(scryptCallback);

export const SESSION_COOKIE = "veloura_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("veloura-dev-auth-secret");
  }
  throw new Error("AUTH_SECRET manquant. Ajoute une clé d'au moins 16 caractères.");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(storedBuf, derived);
}

export function createInviteToken() {
  return randomBytes(24).toString("hex");
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.email || !payload.name || !payload.role) {
      return null;
    }
    return {
      userId: payload.sub,
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as UserRole
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function complementaryRole(role: UserRole): UserRole {
  if (role === "RECIPIENT") return "GIFTER";
  if (role === "GIFTER") return "RECIPIENT";
  return "GIFTER";
}

export function isAppRole(role: UserRole): role is "RECIPIENT" | "GIFTER" {
  return role === "RECIPIENT" || role === "GIFTER";
}
