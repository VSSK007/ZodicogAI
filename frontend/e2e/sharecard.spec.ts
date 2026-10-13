import { expect, test } from "@playwright/test";
import { extractKeyLine, extractScore } from "../lib/shareCard";
import { fixture } from "./helpers";

/** Pure helpers behind the OG image and the story cards (no browser, no server). */

test("a full report's headline score is the overall one, not a sub-engine's", () => {
  const full = fixture<{ relationship_intelligence: { overall_score: number }; emotional: { emotional_compatibility_score: number } }>("full");
  expect(full.emotional.emotional_compatibility_score).not.toBe(full.relationship_intelligence.overall_score); // fixture sanity
  expect(extractScore(full)).toBe(Math.round(full.relationship_intelligence.overall_score));
});

test("single-analysis payloads use their own compatibility score", () => {
  expect(extractScore({ romantic_compatibility_score: 71.4, notes: "x" })).toBe(71);
  expect(extractScore({ compatibility: { compatibility_score: 64.6 } })).toBe(65);
});

test("numerology pairs read the nested compatibility score", () => {
  const pair = fixture<Record<string, unknown>>("numerology-pair");
  const score = extractScore(pair);
  expect(score).not.toBeNull();
  expect(score!).toBeGreaterThanOrEqual(0);
  expect(score!).toBeLessThanOrEqual(100);
});

test("readings without a score give null, and out-of-range numbers are clamped", () => {
  expect(extractScore({ overview: "words only" })).toBeNull();
  expect(extractScore(null)).toBeNull();
  expect(extractScore({ overall_score: 140 })).toBe(100);
  expect(extractScore({ overall_score: -5 })).toBe(0);
});

test("the key line is a clean first sentence, without markdown, within the limit", () => {
  const line = extractKeyLine({
    analysis: { relationship_dynamic: "**Alex** and Jordan balance each other well. They trade momentum and care. Everything else follows." },
  }, 60);
  expect(line).not.toContain("*");
  expect(line.length).toBeLessThanOrEqual(61);
  expect(line.endsWith(".")).toBe(true);
  expect(extractKeyLine({})).toBe("");
});
