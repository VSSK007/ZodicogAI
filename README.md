# ZodicogAI — Hybrid Behavioral Intelligence Platform

**ZodicogAI** is a full-stack relationship intelligence platform powered by deterministic trait modeling and advanced LLM synthesis. Analyze personalities, compatibility, intimacy dynamics, attachment patterns, and receive personalized coaching through **Zodicognac** — an AI agent that knows astrology, psychology, and human behavior.

![Architecture](https://img.shields.io/badge/Frontend-Next.js%20%2B%20React%2019-blue) ![Architecture](https://img.shields.io/badge/Backend-FastAPI-green) ![LLM](https://img.shields.io/badge/LLM-Gemini%202.5%20Flash-orange)

---

## ✨ Core Features

### **1. Individual Analysis**
- **Zodiac Profile** — Sun sign, element, modality, decan profiles with ruling planets and keywords
- **MBTI Typology** — 16 personality types with cognitive functions and social archetypes
- **Hybrid Synthesis** — Combined zodiac + MBTI behavioral analysis with trait radars
- **Color Analysis** — Aura color meanings tied to zodiac signs with power colors and love energy
- **Numerology** — Life path, expression numbers, lucky numbers with psychological readings

### **2. Pair Compatibility**
- **Zodiac Compatibility** — Vector similarity, element/modality interaction, decan synergy
- **MBTI Pairing** — Cognitive function alignment and communication style prediction
- **Romantic Compatibility** — Emotional + romantic scores with relationship dynamic mapping
- **Emotional Compatibility** — Deep dive on attachment patterns and emotional responsiveness
- **Love Language Analysis** — Affirmation, service, gifts, time, and touch preference alignment
- **Love Style Typing** — Eros, Storge, Ludus, Mania, Pragma, Agape mapping and interaction
- **Sextrology** — Sexual character, intimacy dynamics, erogenous focus, fantasy alignment, positions, and long-term passion scores
- **Numerology Compatibility** — Life path + expression number synergy with pursue/avoid signals

### **3. Coaching Intents via Zodicognac**
Smart intent classification routes conversations to specialized coaching modules:

- **Signal Reading** — Decode whether someone is interested; behavioral cue interpretation by type
- **First Date Coaching** — Venue suggestions, conversation topics, first impression moves tailored to their sign/MBTI
- **Red Flags & Green Flags** — Toxic patterns vs. genuine investment signals specific to their archetype
- **Getting Them Back** — Re-approach strategy for exes with type-specific psychology
- **Attachment Style Coaching** — Map anxious/avoidant/secure dynamics to zodiac + MBTI
- **Commitment Progression** — How to move relationships from casual to serious with this specific type

### **4. Visualizations**
- **Trait Radar Charts** — Multi-dimensional behavioral comparison (Framer Motion + Recharts)
- **Score Rings** — Circular compatibility metrics with gradient backgrounds
- **Metric Cards** — Individual trait breakdown with semantic coloring
- **Behavioral Maps** — Behavioral axis positioning (Social/Analytical, Emotional/Logical)
- **Dual Bar Charts** — Side-by-side distribution comparison (Love Languages, Love Styles)
- **Stagger Animations** — Progressive reveal of analysis sections with explicit delay sequencing

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4 + Tailwind Typography
- **Animations**: Framer Motion 12 (motion divs, AnimatePresence, whileInView)
- **Charts**: Recharts 3 (with custom workarounds for Recharts 3 + React 19 compat issues)
- **Type Safety**: TypeScript 5
- **State**: React hooks (useState, useEffect, useContext)
- **HTTP**: Fetch API via custom `apiFetch` wrapper

### Backend
- **Framework**: FastAPI + Uvicorn
- **Language**: Python 3.10
- **Validation**: Pydantic v2 (model validation + schema serialization)
- **LLM**: Google Gemini 2.5 Flash (primary) + Gemini 2.0 Flash Lite (fallback)
- **Deterministic Engines**:
  - `zodiac_engine.py` — Astrology calculations, decans, sign profiles
  - `mbti_engine.py` — Cognitive typology, role groups, function stacks
  - `compatibility_engine.py` — Vector similarity, element interaction, MBTI pairing
  - `emotional_engine.py` — Attachment patterns, emotional responsiveness
  - `romantic_engine.py` — Romantic chemistry, passion alignment, commitment readiness
  - `sextrology_engine.py` — Sexual archetypes, position compatibility, intimacy scoring
  - `love_style_engine.py` — 6 love typologies + compatibility matrix
  - `love_language_engine.py` — 5 love languages + preference distribution
  - `color_engine.py` — Zodiac aura colors, harmony computation, complementary color theory
  - `numerology_engine.py` — Pythagorean letter values, life path, expression, compatibility
  - `decan_engine.py` — Sub-ruler profiles, keyword enrichment, personality nuance
  - `relationship_intelligence_engine.py` — Full-suite analysis combining all engines
- **Chat Pipeline**: Intent classification → Engine dispatch → Prompt templating → LLM synthesis

### Database & Deployment
- **Local Development**: Venv + SQLite (optional)
- **Deployment**: Vercel (frontend) + Render/Railway (backend)
- **Environment**: `.env` for API keys (Gemini)

---

## 🚀 Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Windows (PowerShell) — Kill stale process on port 8000:**
```powershell
$proc = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
ZodicogAI/
├── backend/
│   ├── main.py                          # FastAPI app entry, routes
│   ├── agent_controller.py              # Engine registry + pipeline orchestration
│   ├── gemini_client.py                 # Gemini API client + prompt calls
│   ├── chat/
│   │   ├── chat_handler.py              # Intent classifier + engine dispatch
│   │   └── prompt_templates.py          # 15 coaching intent prompt builders
│   ├── engines/
│   │   ├── zodiac_engine.py
│   │   ├── mbti_engine.py
│   │   ├── compatibility_engine.py
│   │   ├── emotional_engine.py
│   │   ├── romantic_engine.py
│   │   ├── sextrology_engine.py
│   │   ├── love_style_engine.py
│   │   ├── love_language_engine.py
│   │   ├── color_engine.py
│   │   ├── numerology_engine.py
│   │   ├── decan_engine.py
│   │   └── relationship_intelligence_engine.py
│   ├── models/
│   │   └── schemas.py                   # All Pydantic schemas (input/output)
│   ├── tests/                           # Engine unit tests
│   ├── sextrology_data.py               # Sex sign profiles + metadata
│   ├── requirements.txt
│   └── .env                             # API keys (git-ignored)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                     # Home: Zodicognac branding, form switcher
│   │   ├── chat/page.tsx                # Chat interface with Zodicognac coaching
│   │   ├── dashboard/page.tsx           # Relationship Intelligence Dashboard
│   │   ├── analyze/
│   │   │   ├── emotional/page.tsx       # Emotional compatibility analysis
│   │   │   ├── romantic/page.tsx        # Romantic compatibility analysis
│   │   │   ├── sextrology/page.tsx      # Sextrology (solo + pair)
│   │   │   ├── love-language/page.tsx   # Love Language distribution
│   │   │   ├── love-style/page.tsx      # Love Style alignment
│   │   │   ├── zodiac/page.tsx          # Zodiac deep-dive article
│   │   │   ├── color/page.tsx           # Aura color analysis
│   │   │   └── numerology/page.tsx      # Numerology readings
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── HybridForm.tsx               # Home form: zodiac + MBTI input with quiz
│   │   ├── CompatibilityForm.tsx        # Home form: pair compatibility input
│   │   ├── PersonForm.tsx               # Reusable person input (name, DOB, MBTI)
│   │   ├── ScoreRing.tsx                # Circular score visualization
│   │   ├── MetricCard.tsx               # Individual metric display
│   │   ├── TraitRadar.tsx               # Radar chart comparison
│   │   ├── BehavioralMap.tsx            # Behavioral axis positioning
│   │   ├── Navbar.tsx                   # Navigation header
│   │   ├── ZodicogMark.tsx              # Logo component
│   │   ├── ZodicognacMark.tsx           # Zodicognac Z branding
│   │   ├── MbtiSelect.tsx               # MBTI dropdown + quiz
│   │   ├── AuraColor.tsx                # Color preview component
│   │   ├── CompatibilityForm.tsx        # Compatibility pair form
│   │   ├── HybridForm.tsx               # Hybrid analysis form
│   │   └── RevealOnScroll.tsx           # Scroll-triggered animation wrapper
│   ├── lib/
│   │   ├── api.ts                       # API client (apiFetch, pairBody, PersonData)
│   │   ├── motion.ts                    # Motion constants (EASE, EASE_SPRING)
│   │   └── colors.ts                    # Zodiac color palette
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .gitignore
│
├── .claude/
│   ├── projects/d--ZodicogAI/
│   │   └── memory/                      # Auto-memory: user preferences, tech notes
│   └── plans/                           # Implementation plans from plan mode
│
└── README.md                            # This file
```

---

## 🎯 Key Architectural Patterns

### Intent Classification → Engine Dispatch
Every chat message flows through:
1. **Intent Classifier** (Gemini) — maps user message to one of 15 intents
2. **Engine Dispatcher** — selects analysis type (HYBRID, COMPATIBILITY, ROMANTIC, etc.)
3. **Prompt Builder** — injects engine data + personality-specific framing
4. **LLM Response** — Gemini synthesizes conversational reply

### Three-Registry Pattern
**`agent_controller.py`** orchestrates analysis via three registries:
- `_ENGINE_REGISTRY` — Maps engine names to functions
- `_PIPELINE_REGISTRY` — Maps analysis types to engine chains
- `_SCHEMA_REGISTRY` — Maps analysis types to output Pydantic models

### Deterministic + Generative Blend
- **Deterministic Layer**: Zodiac calculations, MBTI logic, compatibility matrices, color theory
- **Generative Layer**: Gemini 2.5 Flash synthesizes interpretations, coaching advice, narratives

### Frontend Animation Strategy
- **Short pages** (emotional, romantic, love-language, love-style, sextrology) — explicit `delay` props on child `motion.div`s (avoids React 19 concurrent render issues with stagger variants)
- **Long pages** (zodiac article) — `whileInView` scroll-triggered reveals via `RevealOnScroll` component
- **Home page** — Zodicognac 5-second slow-burn transition with amber atmospheric glow + progress bar

---

## 🧪 Testing

Unit tests for each engine are in `backend/tests/`. Run with:
```bash
cd backend
pytest tests/ -v
```

---

## 🔮 Known Quirks & Workarounds

### Recharts 3 + React 19 Compatibility
- **Issue**: `radius` and `barSize` props on `<Bar>` leak to DOM as style strings → runtime crash
- **Fix**: Replaced grouped vertical BarCharts with CSS/Framer Motion bars (love-style, love-language pages)

### Windows Font Rendering
- **Issue**: Dropdowns (select) default to Times New Roman instead of inheriting font-family
- **Fix**: Added `@layer base` rule in `globals.css` forcing `font-family: inherit !important` on form elements

### React 19 Stagger Variants
- **Issue**: Framer Motion's `staggerChildren` variant registers children via React context during render, triggering React 19's "state update on unmounted component" warning
- **Fix**: Use explicit `delay` props on each child `motion.div` instead: `transition={{ duration: 0.55, delay: 0.1 }}`

---

## 🚢 Deployment

### Frontend (Vercel)
1. Connect repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable to backend API endpoint
3. Deploy automatically on push to `main`

### Backend (Render / Railway)
1. Create service pointing to `backend/` directory
2. Set environment variables: `GEMINI_API_KEY`, `PYTHONUNBUFFERED=1`
3. Command: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## 📊 Analysis Types Reference

| Intent | Solo Engine | Pair Engine | Use Case |
|--------|-------------|-------------|----------|
| personality_analysis | HYBRID_ANALYSIS | — | Behavioral profile |
| compatibility_question | — | COMPATIBILITY_ANALYSIS | General pairing |
| relationship_advice | — | ROMANTIC_COMPATIBILITY | Relationship guidance |
| flirting_guidance | HYBRID_ANALYSIS | LOVE_STYLE_ANALYSIS | Attraction strategy |
| communication_help | — | COMPATIBILITY_ANALYSIS | Communication gaps |
| sextrology | — | SEXTROLOGY_ANALYSIS | Intimacy dynamics |
| signal_reading | HYBRID_ANALYSIS | COMPATIBILITY_ANALYSIS | Interest decoding |
| first_date_coaching | HYBRID_ANALYSIS | COMPATIBILITY_ANALYSIS | Date planning |
| red_flags_green_flags | HYBRID_ANALYSIS | COMPATIBILITY_ANALYSIS | Pattern recognition |
| getting_them_back | HYBRID_ANALYSIS | ROMANTIC_COMPATIBILITY | Ex reconciliation |
| attachment_style_coaching | HYBRID_ANALYSIS | COMPATIBILITY_ANALYSIS | Attachment mapping |
| commitment_progression | HYBRID_ANALYSIS | ROMANTIC_COMPATIBILITY | Relationship escalation |
| numerology_question | NUMEROLOGY_ANALYSIS | NUMEROLOGY_PAIR_ANALYSIS | Numerology readings |
| color_question | COLOR_ANALYSIS | COLOR_PAIR_ANALYSIS | Aura color meanings |
| general_question | — | — | Open-ended queries |

---

## 🤝 Contributing

Contributions welcome! Fork, branch, commit with clear messages, and submit a PR.

**Code Guidelines**:
- Use TypeScript on frontend, type hints in Python backend
- Keep components small and composable
- Test new engines with `pytest tests/`
- Update this README for feature additions

---

## 📝 License

[Your License Here] — MIT recommended

---

## 🙋 Support & Feedback

For issues, feature requests, or questions, open a GitHub issue or reach out via [your contact method].

---

**Built with 🔮 + 💜 using deterministic astrology + modern AI**
