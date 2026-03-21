"""
ExplanationContext + GeminiExplainer

Separation of concerns:
  - ExplanationContext: builds a structured, injected prompt context from a ScoreBundle
  - GeminiExplainer:    calls the LLM with that context; interprets scores, never generates facts

The LLM's role is INTERPRETATION, not generation.
Every claim in the output is grounded in ScoreBundle data.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from core.score_bundle import ScoreBundle


# ── ExplanationContext ─────────────────────────────────────────────────────────

@dataclass
class ExplanationContext:
    """
    Structured context injected into the Gemini prompt.
    Built from a ScoreBundle — purely from deterministic data, never invented.
    """
    bundle:      ScoreBundle
    person_a:    dict[str, Any]
    person_b:    dict[str, Any] | None = None  # None for single-person analysis
    intent:      str = "general_compatibility"

    def build_system_prompt(self) -> str:
        """
        Render the system prompt for the Gemini call.
        This tells Gemini exactly what role to play and what constraints to follow.
        """
        return (
            "You are Zodicognac, a precise behavioral intelligence analyst. "
            "You will receive pre-computed compatibility scores from deterministic engines. "
            "Your ONLY job is to INTERPRET these scores — never invent facts, "
            "never contradict the scores, never hedge with 'might' or 'could'. "
            "Every claim must trace directly to the data provided. "
            "Be direct, warm, and specific. Use the names provided."
        )

    def build_user_prompt(self) -> str:
        """Render the full user-facing prompt with injected score data."""
        lines = [
            self._render_profiles(),
            "",
            "--- PRE-COMPUTED ENGINE SCORES (deterministic, grounded in math) ---",
            self.bundle.to_prompt_context(),
            "",
            "--- YOUR TASK ---",
            self._render_task(),
        ]
        return "\n".join(lines)

    def _render_profiles(self) -> str:
        a = self.person_a
        lines = [f"PERSON A: {a.get('name', 'Person A')}"]
        if a.get("sign"):      lines.append(f"  Zodiac: {a['sign']}")
        if a.get("mbti"):      lines.append(f"  MBTI:   {a['mbti']}")
        if a.get("element"):   lines.append(f"  Element: {a['element']}")

        if self.person_b:
            b = self.person_b
            lines.append(f"\nPERSON B: {b.get('name', 'Person B')}")
            if b.get("sign"):    lines.append(f"  Zodiac: {b['sign']}")
            if b.get("mbti"):    lines.append(f"  MBTI:   {b['mbti']}")
            if b.get("element"): lines.append(f"  Element: {b['element']}")

        return "\n".join(lines)

    def _render_task(self) -> str:
        tasks = {
            "emotional_compatibility": (
                "Interpret the emotional compatibility scores above. "
                "For each person, describe their emotional style and how they mesh. "
                "Reference the sub-scores directly. End with one concrete suggestion."
            ),
            "romantic_compatibility": (
                "Interpret the romantic compatibility and polarity scores. "
                "Explain the dynamic — who leads, who receives, and how the tension plays. "
                "Be specific to their types, not generic."
            ),
            "sextrology_compatibility": (
                "Interpret the sextrology scores above. "
                "For each person, describe their intimate character and archetype. "
                "Then describe how they interact. Be direct and explicit — no hedging."
            ),
            "general_compatibility": (
                "Provide a comprehensive interpretation of all compatibility scores. "
                "Lead with the overall score narrative, then address each dimension "
                "in order of its weight. Close with the single most important insight."
            ),
        }
        return tasks.get(self.intent, tasks["general_compatibility"])

    @classmethod
    def from_bundle(
        cls,
        bundle: ScoreBundle,
        intent: str = "general_compatibility",
    ) -> "ExplanationContext":
        """Construct from a ScoreBundle using its embedded metadata."""
        meta = bundle.metadata
        return cls(
            bundle=bundle,
            person_a=meta.get("person_a", {}),
            person_b=meta.get("person_b"),
            intent=intent,
        )


# ── GeminiExplainer ────────────────────────────────────────────────────────────

class GeminiExplainer:
    """
    Calls Gemini with the structured ExplanationContext and returns an interpreted result.

    The LLM receives:
      - system_prompt: role definition + constraints
      - user_prompt:   profile data + all deterministic scores + task instruction

    It returns:
      - narrative: string interpretation grounded in the scores
      - confidence: float (from Gemini's structured output)

    It does NOT receive license to invent scores, override data, or speculate.
    """

    def __init__(self, gemini_client):
        self._client = gemini_client

    def explain(
        self,
        context: ExplanationContext,
        history: list | None = None,
    ) -> dict[str, Any]:
        """
        Build prompt from context, call Gemini, return structured response.

        Returns:
            {"response": str, "confidence": float, "scores": dict, "overall": float}
        """
        system_prompt = context.build_system_prompt()
        user_prompt   = context.build_user_prompt()

        # Call Gemini via existing client
        raw = self._client.chat(
            message=user_prompt,
            system_prompt=system_prompt,
            history=history or [],
        )

        # Merge Gemini narrative with deterministic scores for the final response
        return {
            "response":   raw.get("response", ""),
            "confidence": raw.get("confidence", 0.9),
            "scores":     context.bundle.score_map,
            "labels":     context.bundle.label_map,
            "overall":    round(context.bundle.overall_score, 1),
            "breakdown":  context.bundle.to_dict()["dimensions"],
        }
