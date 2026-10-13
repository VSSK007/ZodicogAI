"use client";

/**
 * Partner invites (client side). The inviter creates a link; the partner opens
 * /i/{token}, adds their details and both read the report at /r/{result_id}.
 * Tokens this browser created are remembered so the inviter can come back and
 * see "Waiting" or "Ready".
 */
import { API, type PersonData } from "@/lib/api";
import { authHeaders } from "@/lib/session-token";

const KEY = "zodicog.invites";
const KEEP = 10;

export interface InviteInfo {
  first_name: string;
  sign: string;
  status: "pending" | "accepted" | "expired";
  result_id: string | null;
  expires_at: string;
}

export function myInviteTokens(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function remember(token: string) {
  try {
    const next = [token, ...myInviteTokens().filter((t) => t !== token)].slice(0, KEEP);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Best effort: without storage the inviter just keeps the link they copied.
  }
}

async function errorMessage(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}));
  const detail = (err as { detail?: unknown }).detail;
  return typeof detail === "string" ? detail : `HTTP ${res.status}`;
}

export async function createInvite(inviter: PersonData): Promise<{ token: string; url: string }> {
  const res = await fetch(`${API}/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      inviter: {
        name: inviter.name.trim(),
        day: Number(inviter.day),
        month: Number(inviter.month),
        mbti: inviter.mbti,
        gender: inviter.gender,
      },
    }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  const body = (await res.json()) as { token: string; url: string };
  remember(body.token);
  return body;
}

/** null when the invite doesn't exist. */
export async function getInvite(token: string): Promise<InviteInfo | null> {
  const res = await fetch(`${API}/invites/${encodeURIComponent(token)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as InviteInfo;
}

export async function acceptInvite(token: string, partner: PersonData): Promise<string> {
  const res = await fetch(`${API}/invites/${encodeURIComponent(token)}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partner: {
        name: partner.name.trim(),
        day: Number(partner.day),
        month: Number(partner.month),
        mbti: partner.mbti,
        gender: partner.gender,
      },
    }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return ((await res.json()) as { result_id: string }).result_id;
}
