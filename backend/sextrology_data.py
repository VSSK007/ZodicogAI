"""
Sextrology Data
===============
Per-sign sexual character data synthesised from astrology sources.
Used by both gemini_client.py (analysis prompts) and chat/prompt_templates.py (chat prompts).

Fields per sign:
  rank         — libido ranking 1 (highest) → 12 (lowest)
  character    — core erotic identity and bedroom energy
  position     — signature sex position and why it fits the sign
  turn_ons     — what ignites this sign
  turn_offs    — what kills the mood
  foreplay     — sign-specific foreplay style, preferred body zones, and warm-up techniques
  compatible   — sexually most compatible signs

Sources:
  Sexual profiles:  synthesised from multiple astrology sources
  Foreplay data:    nypost.com/article/best-foreplay-for-each-zodiac-sign/
"""

SEX_SIGN_PROFILES: dict[str, dict] = {
    "Aries": {
        "rank": 2,
        "character": "Sexual acrobats of the Zodiac — tremendous appetite, comfortable with casual encounters; initiates fast, conquers hard, and moves at full speed",
        "position": "The Lap Dance (partner seated, Aries straddles and arches into a backbend — raw independence and physical dominance)",
        "turn_ons": "novelty, aggressive energy, immediate gratification, the thrill of conquest, spontaneity",
        "turn_offs": "routine, predictability, being slowed down, excessive emotional build-up",
        "foreplay": "Aries foreplay lives outside the bedroom — the thrill of a near-miss in public, an argument that tips into desire, or anything carrying a whiff of the illegal or forbidden is pure fuel for the ram. Head, scalp, and face are their hottest erogenous zones: hair pulling, deep forehead kisses, and an aggressive grab ignite them instantly. They are not built for slow burns — match their energy, keep it fast and ferocious, and the taboo factor does the rest.",
        "compatible": ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    },
    "Taurus": {
        "rank": 5,
        "character": "More sensual than sexual — craves tactile immersion; uses food, music, scent, and touch in layers before sex even begins; generous and deeply physical once aroused",
        "position": "Missionary with enhancement (slow, all-consuming — tighten legs, whisper, nipple play; every sense engaged)",
        "turn_ons": "high-thread-count sheets, fine wine, flowers, slow seduction, full multi-sensory experience",
        "turn_offs": "kinky costumes, aggressive advances, being rushed, crude approaches",
        "foreplay": "The neck and throat are Taurus's most electrifying erogenous zones — slow kissing, nibbling, and breathing on the nape of the neck will make them melt. Engage all five senses: scented candles, silk sheets, soft music, and luxurious massage oil before a single kiss. Taurus requires a long, unhurried warm-up — rushing them is the fastest way to shut them down entirely.",
        "compatible": ["Virgo", "Capricorn", "Cancer", "Scorpio", "Pisces"],
    },
    "Gemini": {
        "rank": 10,
        "character": "Masters of verbal seduction who sometimes underdeliver physically — adventurous with requests, craves mental chemistry as much as physical; mood shifts mid-encounter",
        "position": "The Plough (lying at bed edge, legs raised and pushed forward by partner — imaginative, energetic, requires coordination)",
        "turn_ons": "dirty talk, novel experiences, intellectual rapport, variety, playful experimentation",
        "turn_offs": "neediness, emotional clinginess, monotony, silent partners",
        "foreplay": "Gemini's hands and arms are surprisingly sensitive — light tracing up the inner arms and wrists sends electric signals straight to their brain. More than physical touch, verbal foreplay is non-negotiable: send a vivid text hours before, whisper fantasies, and keep them mentally engaged throughout. Playful variation — switching what you're doing every few minutes — prevents Gemini from mentally checking out.",
        "compatible": ["Libra", "Aquarius", "Aries", "Leo", "Sagittarius"],
    },
    "Cancer": {
        "rank": 7,
        "character": "Deeply emotional — requires trust before expressing sexuality; devoted and focused on partner satisfaction; uses intimacy to process feelings, shifts between romantic and raw depending on mood",
        "position": "Cowgirl or Reverse Cowgirl (woman-on-top with full control — romantic when facing him, dominant when facing away; can incorporate restraints)",
        "turn_ons": "trust, elaborate romantic gestures, emotional safety, feeling deeply cherished",
        "turn_offs": "emotional detachment, betrayal, being rushed before feeling safe",
        "foreplay": "The chest and breasts are Cancer's primary erogenous zone — attentive, tender kissing and caressing there unlocks deep arousal. Emotional foreplay is as critical as physical: make Cancer feel completely safe and adored before touching them. Hold them, maintain deep eye contact, and whisper reassuring words — Cancer's body only opens fully when their heart is fully engaged.",
        "compatible": ["Taurus", "Virgo", "Capricorn", "Scorpio", "Pisces"],
    },
    "Leo": {
        "rank": 3,
        "character": "Theatrical and dominant — needs ego validation to unlock full sexual power; extraordinarily generous once adored; performs brilliantly and expects the same energy in return",
        "position": "Sexy Spooning (side-lying intimacy with partner behind — slow, dramatic heat that builds through anticipation and full-body contact)",
        "turn_ons": "flattery, admiration, compliments about appearance and performance, being worshipped and adored",
        "turn_offs": "being told what to do, lack of appreciation, partners who outshine them",
        "foreplay": "Leo's deepest foreplay is being watched — a slow strip tease performed just for them, or better yet performing one themselves with an audience of one, switches them on completely. Unbroken eye contact is non-negotiable; look away or check a phone and the mood dies on the spot. The back and spine are their volcanic erogenous zones, but it is uninterrupted worship — praise, admiring stares, being made to feel like the most magnetic person alive — that truly unlocks them.",
        "compatible": ["Aries", "Sagittarius", "Gemini", "Libra", "Aquarius"],
    },
    "Virgo": {
        "rank": 8,
        "character": "Dual sexual personality — methodical and reserved on the surface, genuinely carnal once comfortable; detail-obsessed and deeply giving in bed; no imperfection goes unnoticed",
        "position": "Standing Tiger / Crouching Dragon (all-fours at bed edge, partner stands behind — precision, full control, no wasted movement)",
        "turn_ons": "cleanliness, orderliness, fresh sheets, courtship rituals, being trusted with vulnerability",
        "turn_offs": "sloppiness, roughness for its own sake, unconventional approaches without context",
        "foreplay": "Virgo's mind must be aroused before their body will follow — talk philosophy, read erotic poetry aloud, or challenge them intellectually and the physical will open naturally. They are ruled by Mercury and simply do not sleep with people who bore them; the cerebral and the carnal are inseparable for this sign. Once engaged, the stomach and abdomen are their secret erogenous zone, and a clean, tidy environment makes the transition from intellectual heat to physical surrender possible.",
        "compatible": ["Taurus", "Capricorn", "Cancer", "Scorpio", "Pisces"],
    },
    "Libra": {
        "rank": 9,
        "character": "Refined and reciprocal — prioritises partner satisfaction above personal need; loves foreplay and kissing above all; sex is aesthetic, mutual, and beautiful rather than raw or primal",
        "position": "The Lotus (partner seated cross-legged, woman sits in his lap facing him, limbs wrapped around torso — grinding, eye contact, deep emotional connection)",
        "turn_ons": "well-decorated settings, luxury, extended kissing, being the ideal partner, atmosphere and aesthetics",
        "turn_offs": "crude approaches, transactional sex, imbalanced giving and receiving",
        "foreplay": "Libra is terminally indecisive, and nothing turns them on faster than a partner who removes that burden entirely — tell them what to wear, what to take off, and what comes next. The theater of sex excites them: clear demands, a dressed-up partner, and a confident director are more effective foreplay than any physical technique. The lower back is their most sensitive zone, but the seduction starts the moment someone shows they know exactly what they want.",
        "compatible": ["Gemini", "Aquarius", "Aries", "Leo", "Sagittarius"],
    },
    "Scorpio": {
        "rank": 1,
        "character": "Horn dogs of the zodiac — the most intense sexual appetite of all signs; values trust and emotional connection as the gateway to transformative, obsessive intimacy",
        "position": "Great Ball Of Fun (seated on exercise ball, woman sits facing away, bouncing — wild, experimental, full access for stimulation)",
        "turn_ons": "deep emotional connection, exploring limits, trust, power dynamics, the forbidden and taboo",
        "turn_offs": "superficiality, shallow encounters, attempts to control or domesticate them",
        "foreplay": "Scorpio has no fear of the dark — blindfolding their partner, or being blindfolded themselves, creates a heightened state of imagination, anticipation, and surrender that puts them exactly where they want to be. The psychological build is the real foreplay: prolonged eye contact, deliberate restraint, and whispered provocations before any touch begins. They crave the feeling of total power or total surrender — tease, withhold, edge, and repeat until neither party can hold out.",
        "compatible": ["Cancer", "Pisces", "Gemini", "Libra", "Aquarius"],
    },
    "Sagittarius": {
        "rank": 4,
        "character": "Always ready — adventurous and enthusiastic with bottomless energy; grows bored without constant novelty; prefers multiple partners over time and needs freedom even inside a relationship",
        "position": "The Sultry Saddle (partner lying with knees bent, woman straddles sideways — adventurous woman-on-top variation with unexpected angles)",
        "turn_ons": "adventure, exotic locations, spontaneous encounters, novelty, a partner who surprises them",
        "turn_offs": "routine, possessiveness, domesticity, predictable sex",
        "foreplay": "Sagittarius foreplay starts with freedom — nude time around the house, morning skin, cooking naked, or skinny dipping removes inhibition and lets arousal arise completely organically. A Sagittarius who feels free and unencumbered in their body is already halfway to wanting you. The hips and inner thighs respond to slow kisses and sustained eye contact, but novelty is always the real accelerant: unexpected locations and a partner who breaks the routine win every time.",
        "compatible": ["Aries", "Leo", "Gemini", "Libra", "Aquarius"],
    },
    "Capricorn": {
        "rank": 6,
        "character": "Surprisingly sexual beneath the professional exterior — engages with full enthusiasm when in the mood; patient, controlled, and slow-burning; uses roleplay to explore repressed sides",
        "position": "The Ape (partner on back with knees to chest, woman squats backward — deep penetration, playful power, hidden intensity revealed)",
        "turn_ons": "intelligence, planned and earned intimacy, power, authority, being seduced by someone competent",
        "turn_offs": "impulsiveness, recklessness, unconventional partners who lack ambition",
        "foreplay": "Mutual masturbation is the Capricorn ace card — it is instructive, equitable, maintains control, and comes with guaranteed returns on investment for both parties. They want to see exactly what works for their partner while demonstrating their own capability, and the knees and backs of the legs are surprisingly sensitive shortcuts to their desire. Seduce a Capricorn through competence: show ambition, speak with authority, and let tension build slowly — they treat intimacy with the same strategic patience they apply to everything.",
        "compatible": ["Taurus", "Virgo", "Cancer", "Scorpio", "Pisces"],
    },
    "Aquarius": {
        "rank": 12,
        "character": "Low sex drive but verbally suggestive — comfortable managing long dry spells; when finally engaged, brings intense experimental energy; needs intellectual and philosophical chemistry first",
        "position": "Scrub-A-Dub Love (bathtub, woman crouches on partner facing away — unconventional, environmental, toys welcome; breaks every typical bedroom expectation)",
        "turn_ons": "unusual personalities, intellectual connection, experimentation, total freedom, novelty above all",
        "turn_offs": "possessiveness, conventional expectations, emotional over-attachment",
        "foreplay": "The calves and ankles are Aquarius's neglected erogenous zones — massaging and lightly kissing the calves creates unexpected arousal that surprises even them. Intellectual foreplay comes first: debate something controversial, share a wild idea, or introduce a novel concept — their mind must be turned on before their body will follow. Introduce technology or unconventional tools into foreplay; Aquarius finds novelty itself erotic.",
        "compatible": ["Gemini", "Aries", "Leo", "Sagittarius"],
    },
    "Pisces": {
        "rank": 11,
        "character": "Romantic and mystical — mentally drifts into fantasy during sex and uses that rich imagination creatively; deeply empathetic and adapts completely to partner's needs; surrendering and boundary-dissolving",
        "position": "The Magic Mountain (both facing with bent legs leaning back on forearms, move toward each other — eye contact, intertwined, slow grinding, deeply emotional)",
        "turn_ons": "fantasy roleplay, emotional reciprocation, subtlety, being swept away in the moment",
        "turn_offs": "emotional detachment, coldness, purely physical encounters with no feeling",
        "foreplay": "Pisces lives in the imagination and fantasy roleplay is their ideal warm-up — an anonymous phone call with instructions to meet somewhere, playing doctor, being led into elaborate make-believe scenarios, or being invited to don a costume and inhabit a character fully awakens their erotic self. The feet are their most powerful physical erogenous zone, and a slow foot massage in a candlelit room bridges the fantasy and the physical beautifully. Pisces does not just want sex — they want a story they can disappear into.",
        "compatible": ["Scorpio", "Cancer", "Taurus", "Virgo", "Capricorn"],
    },
}
