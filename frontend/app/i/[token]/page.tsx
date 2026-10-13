import type { Metadata } from "next";
import InviteClient from "./InviteClient";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function generateMetadata(
  { params }: { params: Promise<{ token: string }> },
): Promise<Metadata> {
  const { token } = await params;
  let who = "Someone";
  try {
    const res = await fetch(`${API}/invites/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (res.ok) who = ((await res.json()) as { first_name: string }).first_name;
  } catch {
    // Metadata is cosmetic; the page itself reports a missing invite.
  }
  const title = `${who} wants to check your compatibility | ZodicogAI`;
  return {
    title,
    description: "Add your birthday and type to see your full compatibility report together. Free, no sign-up.",
    robots: { index: false, follow: false },
    openGraph: { title, type: "website", siteName: "ZodicogAI" },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InviteClient token={token} />;
}
