"""
Sextrology Data — Cosmic Sex Almanac
=====================================
Per-sign sexual character data synthesised from multiple astrology sources.
Powers: gemini_client.py (analysis prompts), chat/prompt_templates.py (Zodicognac chat).

Fields per sign:
  rank           — libido ranking 1 (highest) → 12 (lowest)
  character      — core erotic identity and bedroom energy (used in prompts)
  sex_style      — list of defining sexual personality traits
  position       — signature position string (backward-compatible, used in existing prompts)
  positions      — list of {name, description, why} — full position almanac
  erogenous_zones — list of zones with technique notes
  turn_ons       — what ignites this sign (used in prompts)
  turn_offs      — what kills the mood (used in prompts)
  kinks          — specific kinks, fetishes, and edge preferences
  foreplay       — sign-specific warm-up, preferred zones, and technique (used in prompts)
  compatible     — sexually most compatible signs

Sources:
  yourtango.com (7 articles), muscleandhealth.com, theknot.com — synthesised per sign.
  Erogenous zones: yourtango.com/2018311090 (astrology erogenous zone mapping)
  Kinks: yourtango.com/2016293407 (kink by zodiac sign)
  Positions: muscleandhealth.com, yourtango.com/2014232483, yourtango.com/2016292826,
             yourtango.com/2016296243, yourtango.com/2016291471
  Sexual style: yourtango.com/2017299531
  Foreplay: nypost.com/article/best-foreplay-for-each-zodiac-sign/
"""

SEX_SIGN_PROFILES: dict[str, dict] = {
    "Aries": {
        "rank": 2,
        "character": "Sexual acrobats of the zodiac — enormous appetite, zero patience for build-up; conquers fast, burns at maximum intensity, and needs raw physical dominance from first moment to last; pioneer energy that always has to be first, fastest, and most ferocious",
        "sex_style": [
            "Passionate, spontaneous, and physically demanding — wants sex fast, hot, and at full intensity",
            "Prefers immediate gratification over elaborate build-up; minimal foreplay, maximum action",
            "Motivated by conquest and the thrill of pursuit — the chase is as arousing as the act",
            "Loves morning sex and high-adrenaline encounters",
            "Direct communicator who knows exactly what they want and takes it without hesitation",
            "Hair-pulling, wrestling, and physical struggle are natural extensions of their bedroom energy",
            "Never the same session twice — novelty is non-negotiable",
            "Performs at their best when their partner matches their aggression and energy",
        ],
        "position": "Doggy Style / Wheelbarrow (fast, dominant, primal — Aries controls completely from behind; Wheelbarrow escalates this: receiver holds a plank while Aries stands holding their legs at hip height)",
        "positions": [
            {
                "name": "Doggy Style",
                "description": "Receiver on all fours, Aries penetrates from behind with full physical dominance, controlling pace and depth entirely.",
                "why": "Fast to set up, physically powerful, and lets Aries drive the full pace — their default state.",
            },
            {
                "name": "Wheelbarrow",
                "description": "Receiver balances in a plank/push-up position while Aries stands holding their legs at hip level, penetrating from behind. Requires receiver's core strength and Aries' complete physical control.",
                "why": "Physically demanding, daring, and a conquest that requires strength — everything Aries craves.",
            },
            {
                "name": "The Lap Dance",
                "description": "Partner seated; Aries straddles and arches backward into a dramatic backbend — raw independence and physical dominance performed as a statement.",
                "why": "Aries must lead; the lap dance lets them control pace and showcase their raw physical power.",
            },
            {
                "name": "Reverse Cowgirl",
                "description": "Aries straddles the partner facing away, controlling pace and angle completely with no eye contact.",
                "why": "Full autonomy, dominant, face-free — pure Aries independence expressed physically.",
            },
            {
                "name": "Standing Rear-Entry",
                "description": "Both standing, Aries enters from behind against a wall or other surface — quick, powerful, spontaneous setup with no interruption to rearrange.",
                "why": "Aries doesn't want to pause — standing is urgent, primal, and eliminates any transition time.",
            },
        ],
        "erogenous_zones": [
            "Head and scalp — primary zone; Aries rules the head; scalp stimulation triggers immediate and intense arousal",
            "Face and forehead — deep forehead kisses and face-nuzzling are direct arousal signals",
            "Hair — pulling during sex is one of the most reliable Aries triggers without exception",
            "Lips — aggressive, consuming kissing that matches their full intensity",
        ],
        "turn_ons": "novelty, aggressive energy, immediate gratification, the thrill of conquest and pursuit, spontaneity, morning sex, physical competition that tips into desire, anything forbidden or slightly dangerous",
        "turn_offs": "routine, predictability, being slowed down, excessive emotional build-up, partners who won't match their intensity",
        "kinks": [
            "Hair pulling — giving and receiving with force",
            "Rough sex — intensity-first approach with physicality as the primary language",
            "Wrestling and physical struggle that tips naturally into intimacy",
            "Exhibitionism — performing raw passion and wanting it witnessed",
            "Spontaneous or semi-public encounters",
            "Morning sex with zero preamble",
            "Conquest dynamics — being the pursuer and taking what they want",
        ],
        "foreplay": "Aries foreplay lives outside the bedroom — the thrill of a near-miss in public, an argument that tips into desire, or anything carrying a whiff of the forbidden is pure fuel for the Ram. Head, scalp, and face are their hottest zones: hair pulling, deep forehead kisses, and an aggressive grab ignite them instantly. They are not built for slow burns — match their energy, keep it fast and ferocious, and the taboo factor does the rest.",
        "compatible": ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    },

    "Taurus": {
        "rank": 5,
        "character": "More sensual than sexual — craves total tactile immersion; constructs an entire sensory world with food, music, scent, touch, and texture before sex even begins; deeply generous and physically consuming once fully aroused; Venus-ruled and capable of all-night stamina when the atmosphere is right",
        "sex_style": [
            "Ruled by Venus — the most sensory-indulgent and touch-devoted lover in the zodiac",
            "Exceptional stamina; values slow, lengthy encounters over quickies",
            "Highly responsive to ambiance: candles, dimmed lighting, soft music, scented oils, fine sheets",
            "Extraordinarily generous and attentive — every inch of a partner's body receives focused attention",
            "Can be fully satisfied without penetration — touch and sensation are primary",
            "Will not perform well in a rushed, ugly, or distracting environment",
            "Food play and sensory layering are natural extensions of their erotic style",
            "Traditional seduction tools — luxury, patience, and physical devotion — work every time",
        ],
        "position": "Flat Iron / Missionary with Enhancement (maximum full-body skin contact; slow, all-consuming — tighten legs, whisper, nipple play; every sense simultaneously engaged)",
        "positions": [
            {
                "name": "Flat Iron (Face-Down)",
                "description": "Receiver lies completely facedown on the bed with hips slightly elevated by a pillow. Partner lies on top and penetrates from behind, creating maximum full-body skin-to-skin contact.",
                "why": "Maximum tactile contact — Taurus responds most powerfully to being completely enveloped and consumed by their partner.",
            },
            {
                "name": "Missionary with Enhancement",
                "description": "Classic face-to-face with receiver's legs tightly closed during penetration for added friction. Whispered words, nipple play, and deep eye contact throughout.",
                "why": "Intimate, multi-sensory, and allows the deep body contact that Taurus lives for.",
            },
            {
                "name": "Spooning",
                "description": "Both on their sides facing the same direction; partner embraces and penetrates from behind in full-body contact. Extended, comfortable, and deeply warm.",
                "why": "Full skin contact and total comfort simultaneously — the Taurus ideal.",
            },
            {
                "name": "Lotus",
                "description": "Partner sits cross-legged; Taurus sits in their lap facing them, legs and arms wrapped around. Rocking and grinding rather than thrusting — minimal movement, maximum closeness.",
                "why": "Full-body contact, face-to-face, unhurried pace — matches Taurus's approach at every level.",
            },
        ],
        "erogenous_zones": [
            "Throat and neck — primary zone; Taurus rules the neck; slow kissing, nibbling, or breathing here triggers immediate and intense arousal",
            "Nape of the neck — soft exhaling or nibbling here is devastating",
            "Full body — Taurus responds to slow, deliberate massage from head to toe with full presence",
            "Mouth and lips — kissing is their single most important foreplay act",
        ],
        "turn_ons": "high-thread-count sheets, fine wine and gourmet food, flowers and fragrance, slow full-sensory seduction, partners who take their time and build the entire experience deliberately",
        "turn_offs": "being rushed, crude or crass approaches, aggressive advances without established build-up, anything cheap or low-effort",
        "kinks": [
            "Food play — whipped cream, chocolate, and edible elements during sex",
            "Sensory luxury — silk sheets, soft textures, and scented candles as sexual context",
            "Extended body massage as a complete foreplay ritual",
            "Lingerie and visual aesthetics — Taurus appreciates beautiful presentation",
            "Body worship — both giving and receiving deliberate, unhurried devotion",
        ],
        "foreplay": "The neck and throat are Taurus's most electrifying zones — slow kissing, nibbling, and breathing on the nape will make them melt completely. Engage all five senses before any touch begins: scented candles, silk sheets, soft music, and massage oil set the full stage. Taurus requires a long, unhurried warm-up — rushing them is the fastest way to shut them down entirely. Food as foreplay (strawberries, champagne, anything decadent) bypasses their mind and speaks directly to their body.",
        "compatible": ["Virgo", "Capricorn", "Cancer", "Scorpio", "Pisces"],
    },

    "Gemini": {
        "rank": 10,
        "character": "Masters of verbal seduction who sometimes underdeliver physically — craves mental chemistry as intensely as physical contact; mood shifts mid-encounter; needs constant variety, novelty, and stimulation to stay present; ruled by Mercury, so the mind is the primary sex organ and words are the primary erotic tool",
        "sex_style": [
            "Curious, flexible, playful, and high-energy — wants the best of both worlds simultaneously",
            "Short attention span requires constant stimulation and position-switching throughout",
            "Dirty talk is non-optional — verbal engagement activates them more than most physical techniques",
            "Won't repeat activities frequently; novelty is the primary arousal mechanism",
            "Enthusiastic about experimentation including multiple partners",
            "Fast-paced and adaptable; quickies in unexpected locations are a natural specialty",
            "Sends vivid text foreplay hours before the encounter — the seduction starts long before any touch",
            "Playful hands and sustained teasing are signature foreplay techniques",
        ],
        "position": "69 (giving and receiving simultaneously — the literal physical expression of 'best of both worlds') or The Plough (edge-of-bed rear entry, energetic and requires active coordination)",
        "positions": [
            {
                "name": "69",
                "description": "Mutual simultaneous oral sex. One partner lies back while the other straddles them facing opposite, or both lie on their sides — full mutual stimulation at once.",
                "why": "Gemini wants the best of both worlds simultaneously — 69 is the literal physical manifestation of that.",
            },
            {
                "name": "The Plough",
                "description": "Receiver lies at the edge of the bed with legs raised and pushed forward. Partner stands or kneels at bed level for deep, angled rear entry with active control.",
                "why": "Active, unusual angle, physically demanding — prevents Gemini from mentally drifting away.",
            },
            {
                "name": "Doggy Style (with continuous dirty talk)",
                "description": "Classic rear-entry on all fours with the explicit addition of running verbal commentary — narrating, directing, and describing throughout the entire encounter.",
                "why": "Any position becomes Gemini's favorite when the verbal layer is fully active.",
            },
            {
                "name": "Threesome or Group Dynamic",
                "description": "Sexual activity involving three or more. Gemini naturally ensures all partners receive equal, rotating attention throughout.",
                "why": "Gemini's dual nature craves multiple simultaneous connections; maximum variety is maximum stimulation.",
            },
            {
                "name": "Rapid Position Rotation",
                "description": "A deliberate practice of switching positions every 5–10 minutes throughout a session — no single position held long enough to become routine.",
                "why": "Gemini's greatest enemy is boredom; structured variety prevents mental checkout.",
            },
        ],
        "erogenous_zones": [
            "Arms and shoulders — primary zone; light tracing up the inner arm sends direct signals to their arousal centers",
            "Hands and fingers — finger sucking is a surprisingly potent and direct Gemini trigger",
            "Wrists — light pressure or kisses on the inner wrist creates unexpected arousal",
            "Nervous system (mental) — their mind is the primary erogenous zone; mental stimulation is non-negotiable",
        ],
        "turn_ons": "dirty talk and verbal foreplay starting hours in advance, novel experiences, intellectual rapport established before anything physical, variety and playful experimentation, constant position-switching, texts that build anticipation",
        "turn_offs": "emotional clinginess, neediness, monotony, silent partners, being held in one position or one energy for too long",
        "kinks": [
            "Dirty talk — narration, instructions, explicit praise throughout",
            "Role-playing and character scenarios with established frames",
            "Multiple partners or group settings",
            "Sex toys that add stimulation layers",
            "Quickies in unexpected or semi-public locations",
            "Constant position-switching within a single session",
            "Phone or text foreplay hours before any physical contact",
        ],
        "foreplay": "Gemini's hands and arms are surprisingly sensitive — light tracing up the inner arms and wrists sends electric signals straight to their brain. More than physical touch, verbal foreplay is non-negotiable: send a vivid text hours before, whisper fantasies in detail, and keep them mentally engaged throughout the entire encounter. Playful variation — switching what you're doing every few minutes — prevents Gemini from mentally checking out. Finger sucking during foreplay is an unexpectedly direct trigger for this sign.",
        "compatible": ["Libra", "Aquarius", "Aries", "Leo", "Sagittarius"],
    },

    "Cancer": {
        "rank": 7,
        "character": "Deeply emotional and the most unselfish lover in the zodiac — requires trust and emotional safety before fully expressing sexuality; devoted to partner satisfaction above all else; uses intimacy to process feelings and form permanent bonds; shifts between intensely romantic and surprisingly raw depending on their emotional state",
        "sex_style": [
            "Links sex directly to emotional intimacy — purely physical encounters feel hollow",
            "Most considerate and unselfish lover; consistently prioritizes the partner's experience first",
            "Requires emotional trust before fully opening up — rushing feels like violation",
            "'Up for anything' once inside a committed, deeply trusting relationship",
            "Desires affection throughout — kissing, eye contact, tenderness, and verbal reassurance",
            "Unpredictable and mood-dependent; their emotional state directly shapes sexual energy",
            "May become emotionally expressive (including tears) after particularly deep intimacy",
            "Intense, sustained makeout sessions are as important as penetration itself",
        ],
        "position": "Face-Off / Cowgirl (receiver in partner's lap or on top, face-to-face — maximum emotional intimacy, sustained eye contact, and the full-body closeness Cancer requires to fully open)",
        "positions": [
            {
                "name": "Face-Off",
                "description": "Partner sits on the edge of the bed or a chair; Cancer climbs into their lap facing them, wrapping arms and legs around them completely. Total full-body embrace with constant face-to-face contact.",
                "why": "The most emotionally intimate position — full-body closeness and constant visual connection satisfy Cancer's deepest need.",
            },
            {
                "name": "Sitting-Up Cowgirl",
                "description": "Cancer sits upright on top of the partner face-to-face, controlling all rhythm and depth while maintaining close visual contact and full emotional presence.",
                "why": "Cancer sets the emotional pace, maintains eye contact, and feels in complete control of the intimacy level.",
            },
            {
                "name": "69",
                "description": "Mutual simultaneous oral sex — both giving and receiving at once.",
                "why": "Cancer's deep unselfish nature is perfectly expressed here — pure reciprocal giving with no power hierarchy.",
            },
            {
                "name": "Missionary with Sustained Eye Contact",
                "description": "Classic face-to-face with deliberate, unbroken eye contact maintained throughout — Cancer finds sustained eye contact as intimate as the physical act.",
                "why": "Emotional safety is built through the eyes; this position maximizes that connection.",
            },
            {
                "name": "Spooning",
                "description": "Side-by-side; Cancer receives from behind while being completely physically embraced — warmth, full-body contact, and a deep sense of being held.",
                "why": "Being physically surrounded and held activates Cancer's core need for safety and being cherished.",
            },
        ],
        "erogenous_zones": [
            "Chest and breasts — primary zone; Cancer rules the chest; attentive, tender focus here unlocks deep and sustained arousal",
            "Nipples — nipple play is one of the most reliable Cancer triggers without exception",
            "Belly and stomach — soft caressing of the abdomen creates a nurturing-erotic response",
            "The act of being held — full-body embrace is itself an erogenous zone for Cancer",
        ],
        "turn_ons": "trust built deliberately over time, elaborate romantic gestures, emotional safety, being completely cherished and made to feel irreplaceable",
        "turn_offs": "emotional detachment, treating sex casually or transactionally, betrayal of any kind, being rushed before emotional trust is fully established",
        "kinks": [
            "Nipple play and breast stimulation",
            "Belly rubbing and stomach caressing",
            "Being completely physically held and surrounded during sex",
            "Nurturing or caretaking role-play dynamics",
            "Emotional vulnerability as an erotic act — being seen completely",
            "Extended makeout sessions with full emotional presence",
        ],
        "foreplay": "The chest and breasts are Cancer's primary erogenous zone — attentive, tender kissing and caressing there unlocks deep arousal. But emotional foreplay is as critical as physical: make Cancer feel completely safe and adored before touching them. Hold them, maintain deep eye contact, and whisper specific, genuine words — not generic praise. Cancer's body only opens fully when their heart is fully engaged. The belly and abdomen are secondary zones that respond powerfully to slow, loving touch.",
        "compatible": ["Taurus", "Virgo", "Capricorn", "Scorpio", "Pisces"],
    },

    "Leo": {
        "rank": 3,
        "character": "Theatrical, dominant, and extraordinarily generous once adored — needs ego validation to unlock full sexual power; performs brilliantly and expects the same energy in return; sex is a mutual performance and Leo is always the lead star of that production",
        "sex_style": [
            "Passionate, dramatic, playful, and deeply pleasure-oriented",
            "Needs to be admired, worshipped, and desired at all times during the act",
            "Highly visual — wants to be seen and appreciated; mirror placement is deliberate and intentional",
            "Likes to be in control and does not take direction well from a partner",
            "Many Leos are natural exhibitionists — enjoy having sex where they might be seen",
            "Loves hair-pulling, biting, and scratching during passion",
            "Strip teases — performed for them or by them — are significant arousal triggers",
            "Unbroken eye contact is non-negotiable; losing visual focus ends the mood on the spot",
        ],
        "position": "Doggy Style facing a mirror / Drop the Soap (Leo faces their own reflection — maximum visual dominance, watching themselves and their partner simultaneously, the exhibitionist made physical)",
        "positions": [
            {
                "name": "Doggy Style (with mirror)",
                "description": "Receiver on all fours; Leo penetrates from behind with a full view of both bodies. A mirror positioned in front completes Leo's visual requirements.",
                "why": "Power, dominance, and visual stimulation — all three simultaneously satisfied.",
            },
            {
                "name": "Drop the Soap (Standing at Mirror)",
                "description": "Standing rear-entry with both partners facing a mirror. Leo can watch themselves and their partner simultaneously throughout the entire encounter.",
                "why": "Leo needs to be admired — watching themselves in the act satisfies exhibitionism and ego simultaneously.",
            },
            {
                "name": "Sexy Spooning",
                "description": "Side-by-side intimate spooning with penetration; slow, theatrical heat that builds through sustained anticipation and full-body contact.",
                "why": "Leo can set the pace, be physically lavished upon, and control the slow dramatic burn.",
            },
            {
                "name": "Cowgirl (Leo on Top)",
                "description": "Leo straddles their partner, fully on display and completely controlling all movement while demanding unbroken admiring eye contact from below.",
                "why": "On top, visible, and in full control — Leo's natural position in all things.",
            },
            {
                "name": "Seated Throne",
                "description": "Partner sits in a chair or on the bed edge; Leo sits in their lap facing toward or away, riding from above while being watched and adored from a seated, appreciating perspective.",
                "why": "Leo rules from above — throne positioning matches their self-image and performance energy.",
            },
        ],
        "erogenous_zones": [
            "Back and spine — primary zone; Leo rules the heart and spine; running nails or fingers down the spine creates intense full-body arousal",
            "Hair — Leo's mane is sacred; attentive scalp massage and deliberate hair play ignite them immediately",
            "Mouth and lips — Leo loves consuming, dramatic kissing that matches their theatrical energy",
            "Ego — verbal admiration during sex is a non-physical erogenous zone; constant genuine praise unlocks their full performance",
        ],
        "turn_ons": "flattery and admiration at every stage, compliments about appearance and sexual performance during the act, being worshipped and treated as the most magnetic person alive",
        "turn_offs": "being told what to do, lack of appreciation for their effort or appearance, a partner who outshines them or competes for attention",
        "kinks": [
            "Exhibitionism — sex in view of a mirror or with risk of being seen or witnessed",
            "Hair pulling — both giving and receiving with intention",
            "Biting and scratching during passion",
            "Strip tease as a performance — by them or for them",
            "Being verbally worshipped and praised throughout the entire encounter",
            "Dominance — orchestrating and directing the session completely",
            "Theatrical or audience-aware settings — anywhere that feels like a stage",
        ],
        "foreplay": "Leo's deepest foreplay is being watched — a slow strip performed just for them, or performing one themselves with an audience of one, switches them on completely. Unbroken eye contact is non-negotiable; look away or check a phone and the mood dies immediately. The back and spine are their volcanic physical zones — run nails slowly down the spine for an immediate full-body response. But it is uninterrupted worship — praise, admiring stares, being made to feel like the most magnetic person alive — that truly unlocks Leo's full sexual power.",
        "compatible": ["Aries", "Sagittarius", "Gemini", "Libra", "Aquarius"],
    },

    "Virgo": {
        "rank": 8,
        "character": "Dual sexual personality — methodical and reserved on the surface, genuinely carnal and technically expert once comfortable; researches and mentally prepares for intimacy with the same rigor applied to everything else; detail-obsessed, deeply giving, and harboring the most unexpected kinks in the zodiac beneath a clean exterior",
        "sex_style": [
            "Analytical perfectionist who mentally prepares for encounters in advance",
            "Tactical and methodical — seeks to perfect every technique and understand every preference",
            "Shows feelings through flawless action and detail rather than words",
            "Primal sex is deeply appealing beneath the clean-surface persona",
            "Cleanliness and hygiene are absolute prerequisites for full physical relaxation",
            "Deep eye contact and precise penetration angle are both important to them",
            "Most surprisingly kinky sign alongside Capricorn — enjoys BDSM and bondage as a submissive",
            "Stomach and abdomen are neglected zones that trigger disproportionate arousal",
        ],
        "position": "Leap Frog / Standing Tiger (receiver chest-down with hips elevated, or standing bent forward — Virgo's precision and control expressed through technical depth and no wasted movement)",
        "positions": [
            {
                "name": "Leap Frog",
                "description": "A refined doggy style: receiver presses chest completely to the mattress with hips elevated, arms stretched forward. Partner kneels behind for very deep, controlled penetration.",
                "why": "Virgo's devotion and precision suit the controlled, technically demanding nature of this position.",
            },
            {
                "name": "Standing Tiger / Crouching Dragon",
                "description": "Receiver stands and bends forward bracing against a wall or surface at hip height; partner enters from behind while standing. Clean, precise, no wasted movement.",
                "why": "Methodical and earthy — Virgo's grounded nature connects with standing, controlled positions.",
            },
            {
                "name": "Lotus",
                "description": "Partner sits cross-legged; Virgo sits in their lap facing them with legs wrapped around. Rocking and grinding, deep eye contact and full body awareness maintained.",
                "why": "Allows Virgo to maintain their characteristic awareness of every detail while in deep visual contact.",
            },
            {
                "name": "Missionary with Simultaneous Manual Stimulation",
                "description": "Standard missionary with the addition of precise manual clitoral stimulation throughout — technically multitasked pleasure delivery.",
                "why": "Practical, effective, and technically precise — Virgo appreciates maximizing outcome through correct technique.",
            },
            {
                "name": "Hot Seat (Exercise Ball)",
                "description": "Partner sits on an exercise ball; Virgo sits in their lap facing toward or away. The ball's instability creates natural rhythmic movement and requires coordination.",
                "why": "Unusual, requires precision and balance — appeals to Virgo's love of technique applied to pleasure.",
            },
        ],
        "erogenous_zones": [
            "Stomach and abdomen — primary zone; Virgo rules the digestive system; soft kisses on the belly trigger disproportionate arousal",
            "Lower abdomen trailing downward — the trail from navel toward pelvis is intensely sensitive",
            "Deliberate touch anywhere — Virgo responds powerfully to attentive, unhurried, specific contact",
            "Mind — intellectual arousal must precede the physical; boring conversation kills the libido entirely",
        ],
        "turn_ons": "cleanliness and impeccable personal hygiene, courtship rituals observed properly, being trusted with vulnerability, partners who have mastered a specific technique",
        "turn_offs": "sloppiness or uncleanliness of any kind, roughness introduced without established trust, unconventional approaches presented without context",
        "kinks": [
            "BDSM — particularly the submissive role; relinquishing control is Virgo's secret craving",
            "Bondage — being tied, restrained, or precisely held in place",
            "Latex and uniform or costume play",
            "Medical role-play scenarios",
            "Handcuffs and structured physical restraints",
            "A dominant partner who gives very precise, specific instructions",
        ],
        "foreplay": "Virgo's mind must be aroused before their body will follow — talk philosophy, challenge them intellectually, or engage in detailed discussion and the physical opens naturally. They are ruled by Mercury and simply do not sleep with people who bore them; the cerebral and the carnal are completely inseparable. Once engaged, the stomach and abdomen are their secret erogenous zone — deliberate kisses across the belly will unlock a response that surprises even Virgo. A clean, impeccably tidy environment is non-negotiable for full physical relaxation.",
        "compatible": ["Taurus", "Capricorn", "Cancer", "Scorpio", "Pisces"],
    },

    "Libra": {
        "rank": 9,
        "character": "Refined, reciprocal, and foreplay-obsessed — prioritises partner satisfaction and mutual beauty above personal need; sex is aesthetic, balanced, and graceful rather than raw or primal; secretly more kinky than anyone suspects, with the lower back as their explosive and mostly undiscovered zone",
        "sex_style": [
            "Well-balanced and fair — both partners must feel equally engaged at all times",
            "Foreplay-focused; extended kissing and prolonged arousal-building are essential",
            "Avoids power imbalances; graceful reciprocity is the guiding principle",
            "Enjoys being dominated by a confident partner who removes the burden of decision",
            "Appreciates beauty, aesthetics, and being visually admired throughout",
            "Willing to explore fantasies and stretch boundaries for a valued partner",
            "Lower back and buttocks are their most explosive and underexplored erogenous territory",
            "The kink list (anal play, S/M, spanking) surprises everyone who knows only their elegant surface",
        ],
        "position": "The Lotus / Scissors (Lotus: face-to-face intertwined grinding — perfect symmetry and intimacy; Scissors: both partners equally engaged in matched rocking movements — Libra's ideal of balanced, aesthetic pleasure)",
        "positions": [
            {
                "name": "The Lotus",
                "description": "Partner sits cross-legged; Libra sits in their lap facing them, legs and arms wrapped around. Rocking and grinding rather than thrusting — minimal movement, maximum intimacy.",
                "why": "Beautiful, balanced, intimate — the aesthetic and symmetry of this position appeal to Libra's deepest values.",
            },
            {
                "name": "Scissors",
                "description": "Both partners lie on their sides with legs interlocked. Both make matching rocking movements simultaneously — an equal, mirrored physical conversation.",
                "why": "Perfect equality of engagement — no one is more dominant; this perfectly serves Libra's balance principle.",
            },
            {
                "name": "Seashell",
                "description": "Receiver lies on their back with legs bent completely back over their head. Partner faces them from above with total unrestricted access.",
                "why": "Libra gives total physical access — a complete gesture of trust and balanced giving.",
            },
            {
                "name": "69",
                "description": "Mutual simultaneous oral sex.",
                "why": "Perfect symmetry of giving and receiving — Libra's ideal of equal pleasure made literal.",
            },
            {
                "name": "Cowgirl (Seated, Upright)",
                "description": "Libra on top sitting upright, controlling rhythm gracefully while the partner below admires them.",
                "why": "Libra on display, aesthetically presented, controlling the rhythm — visible beauty in motion.",
            },
        ],
        "erogenous_zones": [
            "Lower back and lumbar region — primary zone; Libra rules the kidneys; focused pressure here triggers intense arousal",
            "Buttocks and glutes — very sensitive and deeply connected to their arousal response",
            "Dimples of Venus — the two indentations at the base of the spine are an explosive hidden trigger",
            "Lips — Libra is the kissing champion; extended, attentive kissing is as important as any position",
        ],
        "turn_ons": "beautifully decorated and aesthetically considered settings, luxury, extended kissing, being the ideal and adored partner, confident partners who take control of decisions",
        "turn_offs": "crude or transactional approaches, imbalanced giving and receiving, being rushed through foreplay, ugly or chaotic environments",
        "kinks": [
            "Anal play",
            "Spanking — giving and receiving",
            "Analingus",
            "S/M dynamics (light to moderate)",
            "Cross-dressing and gender-play scenarios",
            "Role-playing various archetypes",
            "Being confidently dominated while feeling aesthetically appreciated",
            "Lower back and dimple-of-Venus massage as deliberate sexual ritual",
        ],
        "foreplay": "Libra is terminally indecisive, and nothing turns them on faster than a partner who removes that burden entirely — tell them what to wear, what to take off, and exactly what comes next. The theater of sex excites them: clear demands, a beautifully presented partner, and a confident director are more effective foreplay than any physical technique. The lower back is their most sensitive physical zone — focused massage on the lumbar region and dimples of Venus creates arousal disproportionate to the effort. Extended kissing remains their single most reliable foreplay tool.",
        "compatible": ["Gemini", "Aquarius", "Aries", "Leo", "Sagittarius"],
    },

    "Scorpio": {
        "rank": 1,
        "character": "Horn dogs of the zodiac and the most transformative lovers — the most intense sexual appetite of all signs; sex is never casual but always a soul-level experience; uses trust, power, and psychological depth as the gateway to the most obsessive and consuming intimacy imaginable",
        "sex_style": [
            "Widely considered the most sexual sign — thinks about sex constantly and brings total intensity every time",
            "Assertive, non-submissive, and dominant by natural preference",
            "Loyal and devoted but expects complete vulnerability and surrender in return",
            "Demands intense orgasms and marathon sessions — exceptional stamina and control",
            "Full-force, all-or-nothing approach — halfway is an insult to their depth",
            "Uses sex to process deep emotions — it is never merely physical",
            "Loves pushing to the absolute edge of sensation and experience",
            "Edging, orgasm control, and denial are natural tools — Scorpio maintains full rhythmic control",
            "Oral sex is their single most potent weapon and most explosive personal trigger",
        ],
        "position": "Corkscrew / Amazon Warrior (Scorpio dominant and controlling every angle — maximum intensity and power exchange; or edging used as the primary technique within any position)",
        "positions": [
            {
                "name": "Corkscrew",
                "description": "Receiver sits at the edge of the bed turned to one side; Scorpio stands straddling them from behind, entering at an unusual sideways angle.",
                "why": "Scorpio's intensity and control match this distinctively angled, technically demanding approach.",
            },
            {
                "name": "Amazon Warrior",
                "description": "Scorpio squats over a partner who lies on their back with legs raised and bent. Scorpio controls all movement from above in a deep, demanding squat.",
                "why": "Assertive and dominant from above — maximum depth, zero surrender of control.",
            },
            {
                "name": "Edging (Applied to Any Position)",
                "description": "Any position approached with the deliberate technique of edging — bringing the partner to the brink of orgasm, stopping completely, and repeating at length before allowing climax.",
                "why": "Scorpio's defining sexual power is psychological control — edging is their native language.",
            },
            {
                "name": "Great Ball of Fun",
                "description": "Partner seated on an exercise ball; Scorpio sits facing away and controls all bouncing movement — wild, experimental, full access for additional stimulation.",
                "why": "Scorpio's experimental appetite and appetite for unconventional sensation.",
            },
            {
                "name": "Blindfold + Any Position",
                "description": "Any physical position combined with blindfolding the partner (or being blindfolded) — heightening all senses, magnifying anticipation, and building the psychological power dynamic Scorpio craves.",
                "why": "Sensory deprivation is Scorpio's psychological playground — the mind is where they truly operate.",
            },
        ],
        "erogenous_zones": [
            "Genitalia — primary zone; Scorpio rules the sex organs; oral sex is their single most potent trigger without exception",
            "Perineum — extremely sensitive and rarely attended to by other signs",
            "Inner thighs — sustained, deliberate attention here creates intense psychological buildup",
            "Eyes — prolonged deliberate eye contact is itself an erogenous act for Scorpio",
        ],
        "turn_ons": "deep emotional connection as a non-negotiable prerequisite, exploring the absolute limits of sensation, trust earned through genuine vulnerability, power dynamics and controlled surrender, the forbidden and the deeply taboo",
        "turn_offs": "superficiality, shallow encounters, anyone who tries to control or domesticate them",
        "kinks": [
            "Edging and orgasm control or denial — their native sexual language",
            "Blindfolds and sensory deprivation",
            "Bondage — tying and being tied with full established trust",
            "Semi-public sex with risk of discovery",
            "Spanking",
            "Intense sustained eye contact as a deliberate power tool",
            "Dominant/submissive power exchange across the full spectrum",
            "Taboo and edge-play scenarios",
            "BDSM across all levels",
        ],
        "foreplay": "Scorpio has no fear of the dark — blindfolding their partner, or being blindfolded themselves, creates a heightened state of imagination, anticipation, and surrender that puts them exactly where they want to be. The psychological build is the real foreplay: prolonged eye contact, deliberate restraint, and whispered provocations before any physical touch begins. They crave total power or total surrender — tease, withhold, edge, and repeat until the psychological tension becomes unbearable. Oral sex is their most direct and powerful physical trigger.",
        "compatible": ["Cancer", "Pisces", "Gemini", "Libra", "Aquarius"],
    },

    "Sagittarius": {
        "rank": 4,
        "character": "Always ready and perpetually adventurous — bottomless energy, athletic stamina, and an absolute requirement for novelty in location, timing, and method; grows bored without constant stimulation; the zodiac's most enthusiastic sexual explorer and the partner most likely to suggest something genuinely unprecedented",
        "sex_style": [
            "Open-minded, spontaneous, adventurous, and naturally playful",
            "Athletic lovers with exceptional stamina who match and raise their partner's energy",
            "Prone to experimenting mid-encounter — changes preferences without warning",
            "Brings humor and games into the bedroom naturally",
            "Outdoor sex and unusual locations are actual preferences, not just fantasies",
            "Partners need flexibility, adaptability, and genuine willingness to be surprised",
            "Naturally incorporates sex toys and games",
            "Their hips are the most powerful and underestimated erogenous zone — grabbing them during sex is highly effective",
        ],
        "position": "Spread Eagle / The Sultry Saddle (open, uninhibited, adventurous — Sagittarius needs a position that looks and feels like freedom and maximum physical possibility)",
        "positions": [
            {
                "name": "Spread Eagle",
                "description": "A missionary variant where the receiver's legs are spread completely wide to the sides, giving maximum access and depth.",
                "why": "Sagittarius's open-mindedness and love of experimentation fit this uninhibited, expansive position.",
            },
            {
                "name": "The Sultry Saddle",
                "description": "Receiver straddles the partner but turns sideways at an angle — a cowgirl variant with unexpected orientation creating different penetration angles.",
                "why": "An adventurous variation on the familiar — Sagittarius always needs a twist.",
            },
            {
                "name": "Lean Back",
                "description": "Receiver sits or leans back against the partner seated behind them, both facing the same direction. Receiver reclines against partner's chest; both hands are completely free.",
                "why": "Athletic, relaxed, and playful — allows hands-free exploration that Sagittarius uses continuously.",
            },
            {
                "name": "Backwards Doggy Style",
                "description": "Reversed doggy style orientation — angles differ from standard, creating an unusual entry and movement pattern.",
                "why": "Spontaneous and unconventional — Sagittarius needs positions that don't default to expected.",
            },
            {
                "name": "Outdoor / Location-Specific Position",
                "description": "Any position adapted to an outdoor, travel, or non-bedroom setting — the location is part of the sexual experience.",
                "why": "Adventure is the primary Sagittarius aphrodisiac; the environment matters as much as technique.",
            },
        ],
        "erogenous_zones": [
            "Hips and hip bones — primary zone; Sagittarius rules the hips and thighs; grabbing hips firmly during sex dramatically intensifies arousal",
            "Inner thighs — slow, sustained kisses and caressing from knee upward",
            "Thighs — squeezing or pressing during penetration is a direct trigger",
            "Skin generally — Sagittarius responds to free, uninhibited touch anywhere on the body",
        ],
        "turn_ons": "adventure and exotic locations, spontaneous unplanned encounters, novelty in location, timing, and method, partners who break routine and introduce the genuinely unexpected",
        "turn_offs": "routine, possessiveness, domesticity, predictable sex in the same location in the same way repeatedly",
        "kinks": [
            "Outdoor sex — forests, beaches, fields, anywhere that isn't a bedroom",
            "Games and playful scenarios with improvised rules",
            "Travel sex — hotel rooms, unfamiliar cities, international encounters",
            "Spontaneous sex — unplanned, urgent, with no build-up",
            "Costumes and dress-up play",
            "Sex toys integrated naturally into sessions",
            "Athletic, extended high-energy sessions that test stamina",
        ],
        "foreplay": "Sagittarius foreplay starts with freedom — nude time around the house, morning skin-on-skin contact, cooking naked, or skinny dipping removes inhibition and lets arousal arise completely organically. A Sagittarius who feels free and unencumbered is already halfway to wanting you. The hips and inner thighs respond to slow kisses and sustained hip-grabbing, but novelty is always the real accelerant: an unexpected location, an unplanned encounter, or a partner who breaks the routine wins every time.",
        "compatible": ["Aries", "Leo", "Gemini", "Libra", "Aquarius"],
    },

    "Capricorn": {
        "rank": 6,
        "character": "The zodiac's most unexpected deviant — surprisingly and intensely sexual beneath the professional exterior; patient, controlled, and slow-burning with exceptional stamina; uses sex as stress relief and emotional release; the controlled exterior is a precise inversion of their bedroom energy",
        "sex_style": [
            "Most surprisingly kinky sign — the zodiac's most unexpected sexual deviant",
            "Dominant and control-focused; aroused by permission-granting power dynamics",
            "Passionate and deeply attentive to a partner's entire body",
            "Slow, steady approach with self-control and endurance as core features",
            "Balances dry humor with an extremely strong sex drive",
            "Freaky side only emerges once the professional exterior is fully and deliberately dropped",
            "Mutual masturbation is a signature tool — instructive, equitable, and controlled",
            "Knees and legs are their most powerful and neglected erogenous territory",
        ],
        "position": "Deep Impact / Spooning (Deep Impact: receiver on back, legs on Capricorn's shoulders — complete dominance and maximum depth; Spooning: seamless transition from patient loyalty to sustained passion)",
        "positions": [
            {
                "name": "Deep Impact",
                "description": "Receiver lies on their back; Capricorn kneels facing them, lifting the receiver's legs and placing them on their shoulders. Very deep penetration with Capricorn in complete visual and physical control.",
                "why": "Capricorn's dominant, controlling energy is perfectly served — they direct everything from this position.",
            },
            {
                "name": "Spooning",
                "description": "Both lying on their sides facing the same direction; Capricorn enters from behind in a complete, enveloping embrace. Seamless transition from loyal closeness to passion.",
                "why": "Capricorn values comfort, loyalty, and patient buildup — spooning fulfills all three simultaneously.",
            },
            {
                "name": "BDSM Structured Session",
                "description": "A pre-negotiated encounter involving bondage, discipline, or power exchange elements — Capricorn approaches this with characteristic strategic preparation.",
                "why": "Control, power, and structure are core Capricorn values; BDSM is their natural and preferred domain.",
            },
            {
                "name": "The Ape",
                "description": "Partner on their back with knees raised to chest; Capricorn squats backward over them for very deep penetration and maximum physical control from above.",
                "why": "Capricorn's hidden playful side and love of intensity emerge — the unexpected deviant revealed.",
            },
            {
                "name": "Sidesaddle",
                "description": "Receiver lies on their back turned slightly sideways; Capricorn enters from the side at an angle, creating unique penetration geometry and deliberate control.",
                "why": "Methodical and precise — Capricorn's instinctive sensuality fits deliberate, controlled variations.",
            },
        ],
        "erogenous_zones": [
            "Legs and knees — primary zone; Capricorn rules the knees; caressing the legs and squeezing the knees intensifies arousal significantly",
            "Back of the knees — an extremely sensitive secondary zone rarely explored by partners",
            "Calves — running hands firmly up the calves has a direct arousal effect",
            "Inner thighs leading upward from the knees toward the pelvis",
        ],
        "turn_ons": "intelligence and demonstrated competence, planned and earned intimacy that requires patience, power and authority in a partner, being seduced by someone visibly ambitious",
        "turn_offs": "impulsiveness, recklessness, unconventional partners who lack apparent direction or ambition",
        "kinks": [
            "BDSM — dominant role primarily, occasionally exploring submission with trusted partners",
            "High heels and foot/shoe aesthetic",
            "Power differential dynamics — older, authority-figure, or hierarchical scenarios",
            "Permission-granting scenarios — being asked for consent as a deliberate power play",
            "Control dynamics — orchestrating the entire encounter from start to finish",
            "Mutual masturbation as an instructive, controlled, and equitable exploration",
            "Role-play involving power hierarchies or professional settings",
        ],
        "foreplay": "Mutual masturbation is the Capricorn ace card — it is instructive, equitable, maintains control, and comes with guaranteed returns for both parties. They want to see exactly what works for their partner while demonstrating their own capability. Seduce a Capricorn through competence: speak with authority, display ambition, and let tension build deliberately slowly. The knees and backs of the legs are surprisingly sensitive shortcuts: running hands firmly down their legs or squeezing their knees during intimacy unlocks a side they rarely reveal to anyone.",
        "compatible": ["Taurus", "Virgo", "Cancer", "Scorpio", "Pisces"],
    },

    "Aquarius": {
        "rank": 12,
        "character": "The zodiac's sexual rebel — low baseline drive but brings fierce experimental energy when finally engaged; needs intellectual and philosophical chemistry as the non-negotiable prerequisite; comfortable with long dry spells; when switched on, the most progressive and boundary-pushing lover in existence",
        "sex_style": [
            "Free-spirited, unconventional, and refuses ordinary or expected sex",
            "Requires mental stimulation as much as physical — the mind is always the gateway",
            "Rarely likes to do the same thing twice; novelty is the primary arousal mechanism",
            "Sporadic and unpredictable — not always available but intensely present when engaged",
            "Responds strongly to dirty talk and intellectual verbal engagement",
            "Enjoys public sex and anything that feels taboo or genuinely progressive",
            "Loyal and sensitive partners once committed; eccentric approach to everything including intimacy",
            "Calves and ankles are deeply erogenous zones that most partners never discover",
        ],
        "position": "Cowgirl (Aquarius fully empowered and in control) or Scrub-A-Dub Love (bathtub, unconventional setting, toys welcome — breaks every typical bedroom expectation at the environmental level)",
        "positions": [
            {
                "name": "Cowgirl",
                "description": "Aquarius sits on top of the partner facing them, controlling pace, depth, and angle completely — the position of total autonomy.",
                "why": "Free-spirited Aquarius feels fully empowered controlling from above — autonomy is their natural state.",
            },
            {
                "name": "Scrub-A-Dub Love (Bathtub / Shower)",
                "description": "In the bathtub or shower; Aquarius crouches or sits on the partner facing away, with water running and toys potentially introduced. Non-standard environment is essential.",
                "why": "Unconventional environment plus broken expectation — both hallmarks of Aquarius's sexual identity.",
            },
            {
                "name": "Face-to-Face Seated Intimate",
                "description": "Partner sits in a chair or on bed edge; Aquarius sits in their lap facing them with legs wrapped around. Deep eye contact with full-body contact.",
                "why": "Aquarius values meaningful intellectual and emotional connection even within their experimental approach.",
            },
            {
                "name": "Invented / Improvised Position",
                "description": "Aquarius's ideal session includes inventing at least one new position during the encounter — no predetermined plan, pure spontaneous physical experimentation.",
                "why": "They need novelty at the structural level — even the position itself must be new or invented.",
            },
            {
                "name": "Kama Sutra Rotation",
                "description": "Deliberate rotation through multiple complex or unusual positions in a single session — exhausting diversity as a session goal.",
                "why": "Aquarius requires position diversity; variety is the fundamental unit of their sexual satisfaction.",
            },
        ],
        "erogenous_zones": [
            "Calves and ankles — primary zone; Aquarius rules the calves and ankles; massage and kissing here triggers unexpected arousal",
            "Ankle stimulation, holding, or light kissing — startlingly and reliably effective",
            "Non-standard touch zones generally — anything off the conventional stimulation path works better",
            "Mind — intellectual engagement is the primary erogenous zone; a great idea excites Aquarius more than most physical touch",
        ],
        "turn_ons": "unusual personalities who break conventional molds, deep intellectual connection established before anything physical, sexual experimentation and total freedom, novelty above all other considerations",
        "turn_offs": "possessiveness, conventional expectations of any kind, emotional over-attachment, repetition",
        "kinks": [
            "Public or semi-public sex",
            "Cyber sex or phone sex as a primary mode",
            "Group sex and non-conventional relationship structures",
            "Anything that feels taboo or genuinely forbidden",
            "Dirty talk throughout the entire encounter",
            "Progressive or cutting-edge sexual experimentation",
            "Technology-assisted sex — remote stimulation devices, apps, toys",
        ],
        "foreplay": "The calves and ankles are Aquarius's neglected erogenous zones — massaging and lightly kissing them creates unexpected arousal that surprises even Aquarius. Intellectual foreplay comes first: debate something controversial, share a wild idea, or challenge their worldview — their mind must be fully engaged before their body will follow. Introduce technology or unconventional tools into foreplay; Aquarius finds novelty itself erotic. The idea of doing something genuinely unprecedented is their most reliable aphrodisiac.",
        "compatible": ["Gemini", "Aries", "Leo", "Sagittarius"],
    },

    "Pisces": {
        "rank": 11,
        "character": "The most romantic and mystical lover — mentally drifts into rich fantasy during sex and uses that imagination as a creative instrument; deeply empathetic and adapts completely to partner's needs; surrendering and boundary-dissolving; feet are the most potent and sign-specific erogenous zone in the entire zodiac",
        "sex_style": [
            "Intensely romantic, loving, and emotionally present throughout",
            "Values closeness and emotional connection above all physical pleasure",
            "Submissive and sensual — adapts intuitively to whatever the partner needs",
            "Desires complete worship and adoration — wants to feel cherished in every moment",
            "Sets the scene as part of foreplay: candles, flowers, fragrance, aphrodisiacs",
            "Willing to please — often takes the giver role first without being asked",
            "Role-playing fantasy scenarios unlocks their deepest erotic responses",
            "Foot worship is the most powerful and sign-specific Pisces kink in the entire zodiac",
        ],
        "position": "The Magic Mountain / Missionary (The Magic Mountain: face-to-face grinding, intertwined, deeply emotional; Missionary: intimacy baseline, maximum closeness, sustained romantic connection throughout)",
        "positions": [
            {
                "name": "The Magic Mountain",
                "description": "Both partners sitting facing each other with bent legs leaning back on forearms, moving toward each other into a connected grinding position. Eye contact throughout — rocking, swaying, deeply intertwined.",
                "why": "Romantic, subtle, and built entirely around connection rather than mechanics — the most Pisces position possible.",
            },
            {
                "name": "Missionary",
                "description": "Classic face-to-face with full-body contact, sustained kissing, unbroken eye contact, and complete closeness throughout.",
                "why": "Pisces prioritizes face-to-face connection and sustained intimacy — mission accomplished in every sense.",
            },
            {
                "name": "Spooning",
                "description": "Both on their sides; Pisces receives from the partner behind in a complete, warm embrace. Slow, intimate, deeply connected.",
                "why": "Being completely held and surrounded satisfies Pisces's deep need to feel cherished and safe.",
            },
            {
                "name": "Frog Style (On Top, Wide-Legged)",
                "description": "Pisces sits on top in a wide-legged frog squat facing the partner, allowing deep penetration and full face-to-face visual intimacy.",
                "why": "Pisces on top can see and feel everything while maintaining full emotional presence.",
            },
            {
                "name": "Fantasy Role-Play Position",
                "description": "Any position embedded within an established fantasy scenario — the narrative context and character framework matter as much as the physical arrangement.",
                "why": "Pisces lives in imagination; the story they inhabit during sex is half the experience itself.",
            },
        ],
        "erogenous_zones": [
            "Feet — primary zone; Pisces rules the feet; foot massage, kissing, and worship create disproportionate arousal",
            "Toes — toe sucking is among the most effective specific Pisces triggers",
            "Soles and arches — highly sensitive to deliberate, attentive touch",
            "Ankles and lower calves — the transition zone from feet upward responds to sustained attention",
        ],
        "turn_ons": "fantasy roleplay with elaborate scenarios and costumes, emotional reciprocation and being deeply seen, subtlety and poetic approach, being swept completely away into a story",
        "turn_offs": "emotional detachment, coldness, purely physical encounters stripped of feeling or narrative",
        "kinks": [
            "Foot worship — giving and receiving; the most characteristically Piscean kink in the zodiac",
            "Body worship — being adored completely from head to toe",
            "Fantasy role-playing with elaborate scenarios, costumes, and sustained characters",
            "Sensory romantic ritual — candles, flowers, aphrodisiacs as deliberate sexual context",
            "Complete submission and being cared for entirely",
            "Anonymous or mystery-driven scenarios where identity is partially concealed",
        ],
        "foreplay": "Pisces lives in imagination and fantasy roleplay is their ideal warm-up — an anonymous phone call with instructions to meet somewhere, playing doctor, being led into elaborate make-believe, or being invited to inhabit a character fully awakens their erotic self. The feet are their most powerful physical erogenous zone in the entire zodiac — a slow, deliberate foot massage in a candlelit room bridges the fantasy and the physical beautifully. Pisces does not want sex — they want a story they can disappear into completely. Create that story first, and the physical opens without effort.",
        "compatible": ["Scorpio", "Cancer", "Taurus", "Virgo", "Capricorn"],
    },
}
