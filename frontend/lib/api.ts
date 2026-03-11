export const API = "http://127.0.0.1:8000";

export interface PersonData {
  name: string;
  day: string;
  month: string;
  mbti: string;
}

export const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

export function emptyPerson(): PersonData {
  return { name: "", day: "", month: "", mbti: "" };
}

export function validatePerson(p: PersonData, label = "Person"): string | null {
  if (!p.name.trim()) return `${label}: Name is required`;
  const day = Number(p.day), month = Number(p.month);
  if (!p.day || isNaN(day) || day < 1 || day > 31) return `${label}: Day must be 1–31`;
  if (!p.month || isNaN(month) || month < 1 || month > 12) return `${label}: Month must be 1–12`;
  if (!MBTI_TYPES.includes(p.mbti.toUpperCase())) return `${label}: Select a valid MBTI type`;
  return null;
}

export function toPerson(p: PersonData) {
  return { name: p.name.trim(), day: Number(p.day), month: Number(p.month), mbti: p.mbti };
}

export function pairBody(a: PersonData, b: PersonData) {
  const ap = toPerson(a), bp = toPerson(b);
  return {
    person_a_name: ap.name, person_a_day: ap.day, person_a_month: ap.month, person_a_mbti: ap.mbti,
    person_b_name: bp.name, person_b_day: bp.day, person_b_month: bp.month, person_b_mbti: bp.mbti,
  };
}

export async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
