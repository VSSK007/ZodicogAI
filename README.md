<p align="center">
  <img src="https://img.shields.io/badge/ZodicogAI-Behavioral%20Intelligence-7c3aed?style=for-the-badge" />
</p>

<h1 align="center">ZodicogAI</h1>

<p align="center">
  <strong>The world's first hybrid symbolic-generative relationship intelligence engine.</strong><br/>
  Where archetypal psychology meets frontier AI reasoning.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-App_Router-black?style=flat-square" />
  <img src="https://img.shields.io/badge/FastAPI-Python_3.10-009688?style=flat-square" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-Primary_Model-FF6D00?style=flat-square" />
  <img src="https://img.shields.io/badge/Live-zodicogai.com-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square" />
</p>

---

> *"Most relationship apps give you a horoscope. ZodicogAI gives you a behavioral model."*

ZodicogAI is not an astrology app. It is a **behavioral intelligence platform** that treats personality frameworks — zodiac archetypes, MBTI typology, Pythagorean numerology, love style theory — as structured data sources, runs them through deterministic compatibility engines, and synthesizes the output through a large language model grounded in real psychological profiles.

The result is **Zodicognac**: an AI coaching agent with genuine opinions, zero disclaimers, and the ability to answer questions about attraction, intimacy, compatibility, and interpersonal dynamics with specificity that generic AI assistants cannot achieve.

---

## Why This Exists

Every major AI assistant treats relationship questions as general knowledge retrieval. Ask GPT-4 "does an INTJ Scorpio and an ENFP Sagittarius work?" and you get a generic personality overview with heavy hedging.

ZodicogAI takes a different position: **personality is computable**. Archetypes carry structured behavioral signals. Compatibility is a multi-dimensional function, not an opinion. And AI should be grounded in that structure — not generating from scratch.

The platform computes personality vectors, runs them through compatibility matrices tuned for emotional, romantic, sexual, communication, and numerological dimensions, then hands the structured result to Gemini with precise context. The AI interprets data. It does not invent it.

---

## Architecture: Hybrid Deterministic + Generative

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Deterministic│    │  Intent      │                   │
│  │  Engine Layer │    │  Classifier  │                   │
│  │               │    │  (15 intents)│                   │
│  │  · Zodiac     │    └──────┬───────┘                   │
│  │  · MBTI       │           │                           │
│  │  · Emotional  │    ┌──────▼───────┐                   │
│  │  · Romantic   │    │  Prompt      │                   │
│  │  · Sextrology │───▶│  Template    │                   │
│  │  · Love Style │    │  Engine      │                   │
│  │  · Love Lang  │    └──────┬───────┘                   │
│  │  · Numerology │           │                           │
│  │  · Color      │    ┌──────▼───────┐                   │
│  │  · Decan      │    │  Gemini 2.5  │                   │
│  └──────────────┘    │  Flash       │                   │
│                       └──────┬───────┘                   │
└──────────────────────────────┼──────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   Next.js Frontend   │
                    │   Desktop + Mobile   │
                    └──────────────────────┘
```

**The key insight:** Gemini never produces compatibility scores. It interprets them. Every score, trait vector, and behavioral axis is computed deterministically before the LLM sees a single token. This makes results reproducible, explainable, and resistant to hallucination.

---

## Zodicognac — The Intelligence Layer

Zodicognac is the conversational interface. It is not a chatbot wrapped around a personality quiz. It is an AI agent with:

- **15 classified coaching intents** — every question is routed to a purpose-built prompt template with the relevant engine data pre-loaded
- **Profile grounding** — responses are anchored to real zodiac + MBTI + decan data, not general personality descriptions
- **Zero hedging policy** — no "might," "could," or "perhaps." Direct answers. Genuine opinions.
- **Dual-model fallback** — Gemini 2.5 Flash (primary) → Gemini 2.0 Flash Lite (fallback) with exponential backoff

| Intent | What It Answers |
|---|---|
| `personality_analysis` | Who this person actually is, behaviorally |
| `compatibility_question` | What makes two specific profiles work or clash |
| `relationship_advice` | Warm, constructive guidance grounded in real dynamics |
| `flirting_guidance` | Personality-specific attraction and approach strategy |
| `communication_help` | Style-gap analysis and concrete bridging techniques |
| `sextrology` | Intimate compatibility, bedroom dynamics, explicit profiles |
| `signal_reading` | Decode whether specific behaviors mean interest or avoidance |
| `first_date_coaching` | Venue, conversation, first impression — specific to the target's profile |
| `red_flags_green_flags` | Sign/MBTI-specific warning signals and genuine investment markers |
| `getting_them_back` | Re-approach strategy tuned to how this type processes distance |
| `attachment_style_coaching` | Anxious/avoidant/secure dynamics mapped to actual personality data |
| `commitment_progression` | Type-specific roadmap from casual to serious |
| `numerology_question` | Life path and expression number relationship analysis |
| `color_question` | Aura and energy color personality interpretation |
| `general_question` | Anything else in the relationship intelligence domain |

---

## Analysis Dimensions

ZodicogAI evaluates relationships across **10 behavioral dimensions**, each computed independently before synthesis:

| Dimension | Engine | What It Computes |
|---|---|---|
| Zodiac Profile | `zodiac_engine` | Element, modality, decan, archetypal traits |
| MBTI Analysis | `mbti_engine` | Cognitive stack, behavioral patterns, type role |
| Behavioral Compatibility | `compatibility_engine` | Personality vector cosine similarity |
| Emotional Compatibility | `emotional_engine` | Attachment responsiveness, emotional expression alignment |
| Romantic Compatibility | `romantic_engine` | Passion intensity, affection pacing, polarity balance |
| Intimacy / Sextrology | `sextrology_engine` | Sexual archetypes, erogenous focus, long-term fire |
| Love Style Alignment | `love_style_engine` | Eros/Storge/Ludus/Mania/Pragma/Agape interaction matrix |
| Love Language Alignment | `love_language_engine` | Words/Acts/Gifts/Time/Touch preference compatibility |
| Numerology | `numerology_engine` | Life Path + Expression numbers, pursue/avoid signal |
| Aura Colors | `color_engine` | Zodiac color mapping, HSL harmony, compatible color blend |

Full Synastry (`/dashboard`) runs all dimensions in parallel and produces a weighted multi-dimensional intelligence report.

---

## Dual-Identity Product Design

ZodicogAI ships two intentionally distinct experiences from a single codebase — separated at the CSS breakpoint (`md: 768px`), not through separate builds.

| | Desktop | Mobile |
|---|---|---|
| **Identity** | Analytical intelligence platform | Personal AI relationship companion |
| **Navigation** | Horizontal scrollable navbar | Bottom tab bar + raised Zodicognac FAB |
| **Homepage** | Inline analysis forms | Full-screen hero + CTA navigation |
| **Chat profiles** | Persistent sidebar panel | Slide-up bottom sheet |
| **Zodicognac entry** | Pill button (top-right) | Amber pulsing FAB (center tab) |
| **Zodicognac transition** | 5.2s slow-burn on homepage | Same — FAB triggers `/?zn=1` |

The mobile experience treats Zodicognac as the primary entry point. The desktop experience treats the analytical engines as primary.

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **React 19** with TypeScript
- **Tailwind CSS v4** — utility-first, custom mobile design tokens
- **Framer Motion** — page transitions, progressive reveals, bottom sheet animations
- **Recharts 3** — trait radar charts, behavioral scatter maps

### Backend
- **FastAPI** + **Python 3.10+**
- **Pydantic v2** — strict request/response schema validation
- **google-genai SDK** — Gemini 2.5 Flash with structured JSON output
- **Uvicorn** — ASGI server

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open localhost:3000
# Mobile layout: DevTools → device toolbar → 375px
```

---

## API

```
POST /analyze/zodiac          Individual zodiac + MBTI hybrid profile
POST /analyze/emotional        Emotional compatibility
POST /analyze/romantic         Romantic compatibility
POST /analyze/sextrology       Intimacy compatibility
POST /analyze/love-style       Love style alignment (single or pair)
POST /analyze/love-language    Love language alignment (single or pair)
POST /analyze/color            Aura color analysis (single or pair)
POST /analyze/numerology       Numerology (single or pair)
POST /dashboard                Full synastry — all dimensions
POST /chat                     Zodicognac conversational agent
POST /compatibility            Behavioral compatibility score
```

**Chat request:**
```json
{
  "message": "Does she actually like me or is she testing me?",
  "person_a": { "name": "Alex", "day": 14, "month": 8, "mbti": "INTJ", "gender": "M" },
  "person_b": { "name": "Maya", "day": 3, "month": 11, "mbti": "ENFP", "gender": "F" },
  "history": []
}
```

---

## Production

```
Internet → Nginx (SSL/TLS) → Next.js :3000 → FastAPI :8000 → Gemini API
```

```bash
# Deploy
cd /root/ZodicogAI && git pull
rm -rf frontend/.next
cd frontend && npm run build
pm2 restart all
```

---

## Philosophy

Most tools in this space treat personality frameworks as entertainment. ZodicogAI treats them as structured behavioral data — imperfect, symbolic, but carrying genuine signal about how people think, attach, communicate, and connect.

The platform does not claim to predict the future of a relationship. It claims to make the present more legible. To surface patterns that are already there. To give people language for dynamics they already feel.

Zodicognac is not a therapist. She is the most perceptive person in the room — one who has spent years studying why people attract and repel, and who will tell you exactly what she sees.

---

## Contact

**kar1mr@zodicogai.com** · **https://zodicogai.com**

---

*MIT License*
