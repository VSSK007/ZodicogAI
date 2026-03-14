"""
decans_data.py
==============
Complete decan data for all 12 zodiac signs.

Sources merged:
  1. YourTango (Trudi Mentior) — per-sign decan articles
  2. Reddit r/astrologymemes — "Decans for each planet, their rules & influences"
     (14-image post: planetary rulers table + rich personality text per decan)

Planetary ruler system: Triplicity / traditional Western
  Each sign's 3 decans are ruled by the 3 signs of the same element in order.

Structure per sign:
  sign, symbol, element, modality, ruling_planet, date_range
  decans: list of 3 dicts, each with:
    number, date_range, date_range_start/end (MMDD ints)
    sub_ruler, sub_sign
    keywords           — 5 trait keywords
    description_short  — concise engine-facing summary (YourTango)
    description_rich   — full personality portrait (Reddit images)

Helpers:
  get_decan(sign, birth_date)           → raw decan dict
  get_decan_modifier(sign, birth_date)  → decan + vector_modifier dict
"""

from datetime import date as _date


DECANS = {

    "aries": {
        "sign": "Aries", "symbol": "♈", "element": "Fire", "modality": "Cardinal",
        "ruling_planet": "Mars", "date_range": ("March 21", "April 19"),
        "decans": [
            {
                "number": 1, "date_range": "March 21 – March 30",
                "date_range_start": 321, "date_range_end": 330,
                "sub_ruler": "Mars", "sub_sign": "Aries",
                "keywords": ["pioneering", "fearless", "impulsive", "enthusiastic", "childlike"],
                "description_short": (
                    "Pure Aries energy. Loves to be first. Fearless and determined with "
                    "infectious enthusiasm — but notoriously impulsive. Famous for forging "
                    "new paths that often lead to unexpected trouble."
                ),
                "description_rich": (
                    "The Mars decan of Aries is the pioneering and energetic decan above all. "
                    "Characterized by a childlike innocence that is quite endearing, with a real "
                    "ability to excite people around them. They want to live in the fullest sense — "
                    "danger, adventure, introspection — always with great enthusiasm. Can be egoistic "
                    "and self-serving but seldom mean harm. Their ideals couldn't be higher, yet "
                    "they're easy to please, needing only passion and authenticity. No patience; "
                    "must do things immediately. Endurance is not their strongest trait, but what "
                    "they lack in staying power they make up for in initiative and exuberance."
                ),
            },
            {
                "number": 2, "date_range": "March 31 – April 9",
                "date_range_start": 331, "date_range_end": 409,
                "sub_ruler": "Sun", "sub_sign": "Leo",
                "keywords": ["noble", "focused", "pompous", "patient", "approval-seeking"],
                "description_short": (
                    "Influenced by Leo and the Sun — a noble individual whose principles remain "
                    "intact under pressure. More patient than Decan 1 but ego can be a problem. "
                    "Generous and inspiring, yet well-being depends on others' approval."
                ),
                "description_rich": (
                    "The Leo/Sun decan of Aries pictures a very noble individual whose principles, "
                    "aims and ambitions remain intact in the most trying circumstances. Single-mindedly "
                    "focused yet can retain the big picture. Ego can be a problem — the self-righteousness "
                    "of Aries has acquired a dash of pompousness. There is somewhere quite a reservoir "
                    "of smugness and self-celebration. Generous and great at inspiring others; mentality "
                    "is eager and forceful, yet more patient than the typical Arian. Actions carry more "
                    "flair and drama than usual, but they hurt easily and have a very sensitive spirit — "
                    "in spite of their confidence, well-being and self-respect depend much on the "
                    "approval of others."
                ),
            },
            {
                "number": 3, "date_range": "April 10 – April 19",
                "date_range_start": 410, "date_range_end": 419,
                "sub_ruler": "Jupiter", "sub_sign": "Sagittarius",
                "keywords": ["expressive", "independent", "altruistic", "restless", "opinionated"],
                "description_short": (
                    "The most sociable Aries. Influenced by Jupiter/Sagittarius — bold, brash, "
                    "restless, and fiercely independent. Extremely expressive and altruistic; "
                    "resistant to herd mentality. Likely to travel widely."
                ),
                "description_rich": (
                    "The Jupiter/Sagittarius decan of Aries is bold and brash — more restless and "
                    "eager to finish than even the first decan. The intellectual enthusiast; "
                    "individualism is very strong and this person will do much to avoid becoming "
                    "a victim of herd mentality. Very independent and will never succumb completely "
                    "to the demands of a lover or companion. Sometimes naive to the point of pure "
                    "childishness, suddenly they can seem like the wisest person in town. Usually "
                    "very altruistic and generous but can become a moral preacher who believes they "
                    "know better than others what those others need and want. Third decan Arians "
                    "are likely to move around a lot and probably travel much."
                ),
            },
        ],
    },

    "taurus": {
        "sign": "Taurus", "symbol": "♉", "element": "Earth", "modality": "Fixed",
        "ruling_planet": "Venus", "date_range": ("April 20", "May 20"),
        "decans": [
            {
                "number": 1, "date_range": "April 20 – April 30",
                "date_range_start": 420, "date_range_end": 430,
                "sub_ruler": "Venus", "sub_sign": "Taurus",
                "keywords": ["sensual", "determined", "stable", "aesthetic", "inflexible"],
                "description_short": (
                    "Venus-pure Taurus: determined, sensual, stable. A peacemaker and lover "
                    "but very unlikely to be flexible on values. High moral standards, "
                    "aesthetician, pragmatist — sometimes nature-mystic or occultist."
                ),
                "description_rich": (
                    "The Venus decan of Taurus produces a very determined, sensual and stable "
                    "person — a peacemaker and lover, yet very unlikely to be flexible to the "
                    "values and ideas of others. They excel in any area they can truly make their "
                    "own, but have trouble adjusting and will not easily find rapid new ways of "
                    "learning. Sexuality and indulgence of the senses is at the core of their "
                    "life and awareness — still they are not likely to be imprudent or unfaithful, "
                    "and typically have high moral standards. Many are aestheticians, yet because "
                    "of their realism and materialism seldom speculative in an otherworldly sense. "
                    "In the same token they can be nature-mystics or even occult, in spite of "
                    "being complete pragmatists and no-nonsense characters."
                ),
            },
            {
                "number": 2, "date_range": "May 1 – May 10",
                "date_range_start": 501, "date_range_end": 510,
                "sub_ruler": "Mercury", "sub_sign": "Virgo",
                "keywords": ["tactful", "charming", "cynical", "graceful", "pragmatic"],
                "description_short": (
                    "Virgo/Mercury influence: great tact and finely tuned sensory apparatus. "
                    "Quiet charmers — seemingly shy but unlikely to pass up what they set their "
                    "minds to. More flexible than Decan 1 but can bore others with cynicism."
                ),
                "description_rich": (
                    "The Virgo/Mercury decan of Taurus often have a great sense of tact and an "
                    "incredibly finely tuned sensory apparatus. Careful in speech and musical in "
                    "voice, they can be quiet charmers — seemingly shy but unlikely to pass up "
                    "what they set their minds to. There is grace, and more flexibility than "
                    "Taureans in general. However, they can also bore people with a sometimes "
                    "overly realistic and pragmatic world view. The streak of cynicism is never "
                    "quite far away, and they don't keep much restraint in pointing out the faults "
                    "of people around them. Many are culinary aristocrats. There is little in "
                    "professional or day-to-day life that they cannot handle, given enough time "
                    "and the right means."
                ),
            },
            {
                "number": 3, "date_range": "May 11 – May 20",
                "date_range_start": 511, "date_range_end": 520,
                "sub_ruler": "Saturn", "sub_sign": "Capricorn",
                "keywords": ["disciplined", "methodical", "loyal", "humorous", "builder"],
                "description_short": (
                    "Saturn/Capricorn influence: great builders — stern and sometimes boring, "
                    "but completely loyal and steady. Humorous and sensual once past their "
                    "austere exterior. Among the most disciplined in all the zodiac."
                ),
                "description_rich": (
                    "Saturn's third decan Taureans are the great builders of their time. They "
                    "can be stern and sometimes outright boring, but are completely loyal and "
                    "steady as rocks. Once you get past their somewhat austere exterior, they "
                    "turn out to be humorous and sensual with a love of the good things in life. "
                    "These Taurus are some of the most disciplined in all of the zodiac, and "
                    "typically carry out every task and objective with great prudence, care and "
                    "patience. Highly methodical. At the same time, they may be lacking some in "
                    "imagination, and are held back by their sombre temperament and skeptical "
                    "attitude. In business and any real-world matter, they can achieve most "
                    "anything they set their minds to."
                ),
            },
        ],
    },

    "gemini": {
        "sign": "Gemini", "symbol": "♊", "element": "Air", "modality": "Mutable",
        "ruling_planet": "Mercury", "date_range": ("May 21", "June 20"),
        "decans": [
            {
                "number": 1, "date_range": "May 21 – May 31",
                "date_range_start": 521, "date_range_end": 531,
                "sub_ruler": "Mercury", "sub_sign": "Gemini",
                "keywords": ["curious", "perceptive", "youthful", "shallow", "sociable"],
                "description_short": (
                    "Mercury-pure Gemini: observers and curious seekers, always ready to be "
                    "distracted. Intelligent in a rapid, logical way. Life of the party but "
                    "often emotionally shallow — forever young."
                ),
                "description_rich": (
                    "First decan Geminis are observers and curious seekers, always ready to be "
                    "distracted by a marvellous scenery, an interesting thought or entertaining "
                    "conversation. Typically intelligent in a rapid, logical and detached way, "
                    "still sometimes at loss in applying their fine minds to deeper thought or "
                    "powerful, systematic reasoning. These people can easily become the life of "
                    "the party, sharing a great love of light social situations where the people "
                    "are many and the demands are low. Many feel depressed about getting older — "
                    "sort of a Peter Pan syndrome — and indeed do have an eternal youthfulness. "
                    "They are perceptive and shrewd, but often emotionally shallow."
                ),
            },
            {
                "number": 2, "date_range": "June 1 – June 11",
                "date_range_start": 601, "date_range_end": 611,
                "sub_ruler": "Venus", "sub_sign": "Libra",
                "keywords": ["beauty-seeking", "empathetic", "logical", "fussy", "charming"],
                "description_short": (
                    "Libra/Venus influence: curious seeker of beauty and comradeship. "
                    "More empathetic than Decan 1, less restless — but can be fussy and "
                    "overly sensitized. One of the finest logical minds in the zodiac."
                ),
                "description_rich": (
                    "The Libra/Venus decan of Gemini is a curious seeker of beauty and "
                    "comradeship. They are truly people's people and will sacrifice much for an "
                    "hour of great conversation. Since they are more likely to become entranced "
                    "or find value in unexpected things, and tend to be at least mentally empathetic, "
                    "they can usually keep themselves at bay and aren't as restless as first decan "
                    "Geminis. However, they can be very fussy and easily disrupted, having a highly "
                    "sensitized and overly active consciousness. They have one of the finest logical "
                    "minds of the zodiac, but can also shift uncomprehendingly between clear-headed "
                    "analysis and a wealth of irrational notions. Charming but sometimes shallow."
                ),
            },
            {
                "number": 3, "date_range": "June 12 – June 20",
                "date_range_start": 612, "date_range_end": 620,
                "sub_ruler": "Uranus", "sub_sign": "Aquarius",
                "keywords": ["humanitarian", "detached", "knowledgeable", "visionary", "independent"],
                "description_short": (
                    "Aquarius/Uranus influence: the most detached yet most humanitarian Gemini. "
                    "Great with concepts and ideas; assimilates knowledge from everywhere. "
                    "Romantically needs change and space."
                ),
                "description_rich": (
                    "The Aquarius/Uranus/Saturn decan of Gemini is the most detached and "
                    "unemotional, yet most humanitarian of the Gemini decans. These people are "
                    "great with concepts and ideas, and relate to every kind of person easily with "
                    "their sociable and friendly attitude. Yet quickness of judgement and a temporary "
                    "fixation upon one thing hinders the otherwise admirable Gemini inclination for "
                    "assimilation and impartiality. They soak up knowledge of every kind and seek "
                    "a combination of breadth of learning and some personal vision that sets them "
                    "apart from mere copycats. Romantically they need change and space, and aren't "
                    "great in an emotionally demanding atmosphere."
                ),
            },
        ],
    },

    "cancer": {
        "sign": "Cancer", "symbol": "♋", "element": "Water", "modality": "Cardinal",
        "ruling_planet": "Moon", "date_range": ("June 21", "July 22"),
        "decans": [
            {
                "number": 1, "date_range": "June 21 – July 1",
                "date_range_start": 621, "date_range_end": 701,
                "sub_ruler": "Moon", "sub_sign": "Cancer",
                "keywords": ["nurturing", "loyal", "jealous", "intuitive", "memory-driven"],
                "description_short": (
                    "Moon-pure Cancer: the fruitful mother-earth decan. 'Heart' is a keyword. "
                    "Highly intuitive and fascinated by the past. Shows great drive and "
                    "determination when needed; will never forget a wrongdoer."
                ),
                "description_rich": (
                    "The Moon decan of Cancer is the fruitful mother-earth decan. Both sexes "
                    "seem very authentic in character while also incredibly sensitive. 'Heart' "
                    "is a keyword in their life and everything they do. They care and tend to "
                    "the people close to them with unending energy and compassion, but demand "
                    "great loyalty from friends and lovers alike. Very jealous. When needed, "
                    "they show a great reserve of drive and determination, yet can lose balance "
                    "by a single thoughtless, insensitive comment. They'll never forget a "
                    "wrongdoer, but aren't really that vindictive. Highly intuitive and fascinated "
                    "by the past and their reservoir of memories."
                ),
            },
            {
                "number": 2, "date_range": "July 2 – July 11",
                "date_range_start": 702, "date_range_end": 711,
                "sub_ruler": "Pluto", "sub_sign": "Scorpio",
                "keywords": ["deep", "possessive", "psychological", "seductive", "persistent"],
                "description_short": (
                    "Scorpio/Pluto influence: very deep feelings, seemingly bottomless. "
                    "Reserved and may seem devoid of emotion — the opposite is true. "
                    "Very possessive but incredibly giving with a partner. Wonderful "
                    "psychologists; endlessly persistent."
                ),
                "description_rich": (
                    "Very deep feelings, seemingly bottomless, is typical for these second decan "
                    "Cancers with Scorpio doing some of the influencing. They are reserved and "
                    "may act unapproachable, to the degree that they seem almost devoid of "
                    "emotion. The complete opposite is true. With a partner they are very "
                    "possessive but incredibly giving and willing to sacrifice themselves. They "
                    "have great instincts and make wonderful psychologists, counselors or "
                    "detectives. They want to get to the bottom of every problem. If they really "
                    "want something, they can be driving and endlessly persistent. There is a "
                    "mysterious side to them which escapes explanation, and they are very seductive "
                    "in the right atmosphere."
                ),
            },
            {
                "number": 3, "date_range": "July 12 – July 22",
                "date_range_start": 712, "date_range_end": 722,
                "sub_ruler": "Neptune", "sub_sign": "Pisces",
                "keywords": ["sensitive", "helper", "moody", "imaginative", "intuitive"],
                "description_short": (
                    "Pisces/Neptune influence: may be the most sensitive decan of all 36. "
                    "Tireless helpers and nurturers. Moodiness most pronounced here — feelings "
                    "change faster than clouds. Imagination highly developed; great with "
                    "children and animals."
                ),
                "description_rich": (
                    "The Pisces/Neptune/Jupiter decan of Cancer may be the most sensitive decan "
                    "of all 36 in the zodiac. As sensitive to the needs of others as to their "
                    "own feelings, they can be truly tireless helpers and nursers of their close "
                    "environment. At the same time, the moodiness that typically strikes Cancer "
                    "children is even more pronounced here, and their feelings change faster than "
                    "clouds without any rational explanation. They often seem mysterious, shy and "
                    "reserved, but almost always dramatically sweet personalities as one gets to "
                    "know them. Imagination is highly developed, and intuition is unsurpassed. "
                    "Children and small animals usually make these people fall apart completely, "
                    "and they are great with them."
                ),
            },
        ],
    },

    "leo": {
        "sign": "Leo", "symbol": "♌", "element": "Fire", "modality": "Fixed",
        "ruling_planet": "Sun", "date_range": ("July 23", "August 22"),
        "decans": [
            {
                "number": 1, "date_range": "July 23 – August 2",
                "date_range_start": 723, "date_range_end": 802,
                "sub_ruler": "Sun", "sub_sign": "Leo",
                "keywords": ["self-reliant", "approval-seeking", "creative", "theatrical", "high-maintenance"],
                "description_short": (
                    "Sun-pure Leo: naturally self-reliant with a warm, satisfied presence. "
                    "Sensitive heart and ego — completely dependent on others' approval. "
                    "Creative in a theatrical way; likes to be at the gravitational center "
                    "of events. Can be pompous and self-righteous."
                ),
                "description_rich": (
                    "Big Leo sun number one — at least that's how many first decan Leos see "
                    "themselves. These folks are naturally self-reliant and have a sort of warm, "
                    "satisfied presence. On the other hand, they have sensitive hearts and egos, "
                    "and are completely dependent on the approval of others. They win others over "
                    "easily, but need to keep doing it for the sake of their own confidence. They "
                    "like organization and being at the gravitational center of events. Very creative "
                    "in a theatrical way. They bring light to the world yet annoy people with their "
                    "pomposity and self-righteousness. A good number of Leos are what might be "
                    "termed high maintenance."
                ),
            },
            {
                "number": 2, "date_range": "August 3 – August 12",
                "date_range_start": 803, "date_range_end": 812,
                "sub_ruler": "Jupiter", "sub_sign": "Sagittarius",
                "keywords": ["traditional", "spiritual", "optimistic", "lucky", "stubborn"],
                "description_short": (
                    "Sagittarius/Jupiter influence: traditional and conservative around values. "
                    "Great spiritual yearning; sense of having the Midas touch. Boundless "
                    "optimism but headstrong stubbornness. Natural gamblers and risk-takers."
                ),
                "description_rich": (
                    "These second decan Leos can be quite traditional and conservative, at least "
                    "when it comes to values and beliefs. They tend to respect religion and academia "
                    "and have great spiritual yearning for discovery and knowledge. Here is a sense "
                    "of having the Midas touch, for Jupiter brings luck and zeal to the prominence "
                    "of the Leo sun. These people can be gamblers in the real sense and risk takers "
                    "at every moment in life. They have boundless optimism yet also headstrong "
                    "stubbornness, naivety and sometimes a rather blunt and unpolished social style. "
                    "They would make great advertisers or cultural organizers, or generally inspiring "
                    "people. They usually have a nice vein of creativity running in their own body."
                ),
            },
            {
                "number": 3, "date_range": "August 13 – August 22",
                "date_range_start": 813, "date_range_end": 822,
                "sub_ruler": "Mars", "sub_sign": "Aries",
                "keywords": ["ambitious", "chivalrous", "frank", "stubborn", "emotionally-volatile"],
                "description_short": (
                    "Aries/Mars influence: one of the most ambitious and chivalrous of all "
                    "decans. Heart-of-gold characters, frank and honest. Real drive — likely "
                    "to rise to a managing position. Cool-headedness is not a strong trait."
                ),
                "description_rich": (
                    "The Aries decan of Leo with rays from Mars is one of the most ambitious "
                    "and chivalrous of all decans. Sometimes these people will drive others "
                    "crazy through their simple self-righteousness and stubborn refusal to "
                    "admit a mistake. But they are typically heart-of-gold characters, intent "
                    "on playing their cards face up and being frank and honest with the world. "
                    "There is real drive in these people, whether obvious or hidden within, "
                    "and their sheer optimism can carry them through difficult times. Whatever "
                    "field of work or interest they pursue, it is likely they'll have the desire "
                    "to rise to a managing or leading position. They are both good at improvisation "
                    "and organization. A too easily aroused emotional nature may become a problem. "
                    "Cool-headedness is not a strong trait."
                ),
            },
        ],
    },

    "virgo": {
        "sign": "Virgo", "symbol": "♍", "element": "Earth", "modality": "Mutable",
        "ruling_planet": "Mercury", "date_range": ("August 23", "September 22"),
        "decans": [
            {
                "number": 1, "date_range": "August 23 – September 2",
                "date_range_start": 823, "date_range_end": 902,
                "sub_ruler": "Mercury", "sub_sign": "Virgo",
                "keywords": ["specialist", "unassuming", "obsessive", "niche-finder", "varied"],
                "description_short": (
                    "Mercury-pure Virgo: the most varied Virgo type. Usually specialists and "
                    "obsessed categorizers, finding a niche and sticking to it. Unassuming, "
                    "seldom concerned with prestige. Some braggarts; some bohemians."
                ),
                "description_rich": (
                    "The Mercury decan of Virgo is the best example of the extremely varied "
                    "Virgo type, seemingly lacking any clear uniting principle. First decan "
                    "Virgos tend to be unassuming, yet some are constantly talking and bragging. "
                    "They tend to be fussy and orderly, yet many turn this idea around by their "
                    "bohemian exterior and messy homes. What might be said about all Virgos of "
                    "this decan is that they are usually specialists and obsessed categorizers "
                    "in some measure, finding a niche within life and sticking to it. This is "
                    "often for practical reasons such as simple self-improvement for a better "
                    "day-to-day life. They are seldom much concerned about prestige and worldly "
                    "recognition."
                ),
            },
            {
                "number": 2, "date_range": "September 3 – September 12",
                "date_range_start": 903, "date_range_end": 912,
                "sub_ruler": "Saturn", "sub_sign": "Capricorn",
                "keywords": ["materialistic", "organized", "unforgiving", "ambitious", "unemotional"],
                "description_short": (
                    "Capricorn/Saturn influence: usually quite materialistic, with great "
                    "organizational and money-making ability. Responsible and tactful, but "
                    "unforgiving towards people who let them down. Unemotional even in "
                    "devastating situations."
                ),
                "description_rich": (
                    "Second decan Virgos are usually quite materialistic, without any great "
                    "desire for luxury. Security is at the forge, and they have great "
                    "organizational and general money-making ability — they don't spend money "
                    "recklessly. They are responsible, tactful and great administrators of the "
                    "affairs of men, but can become quite one-sided and lacking in perspective. "
                    "While Saturn betters the ability to see the big picture and strengthens the "
                    "sense of ambition, it also lessens the flexibility and adaptability. These "
                    "individuals are usually unforgiving towards people who let them down, while "
                    "they keep a very practical, unemotional stance even in facing emotionally "
                    "devastating situations."
                ),
            },
            {
                "number": 3, "date_range": "September 13 – September 22",
                "date_range_start": 913, "date_range_end": 922,
                "sub_ruler": "Venus", "sub_sign": "Taurus",
                "keywords": ["artistic", "slow-learner", "stylish", "reserved", "sweet"],
                "description_short": (
                    "Venus/Taurus influence: downplayed but considerable artistic sensitivity. "
                    "Slow burners and learners — steady, quiet, reserved. Great dressers with "
                    "a fine sense of style. Can become stubborn and petty, yet have a sweetness "
                    "that can always be regained."
                ),
                "description_rich": (
                    "Many third decan Virgos have a downplayed but considerable artistic "
                    "sensitivity, especially when it comes to materials, shape, colour and form. "
                    "Perhaps they are amateur painters. Or professionals. Or skilled musicians, "
                    "steadily building a technical mastery of their instrument. They are slow "
                    "burners and learners. Steady, quiet and reserved, and usually don't talk "
                    "unless they feel it is important. They are great dressers and have a "
                    "generally fine sense of style. They feel safest at home, where there is "
                    "always some practical issue to confront. They can become stubborn and fussy, "
                    "petty and very narrow-minded, yet have a sweetness over them that can be "
                    "regained and maintained."
                ),
            },
        ],
    },

    "libra": {
        "sign": "Libra", "symbol": "♎", "element": "Air", "modality": "Cardinal",
        "ruling_planet": "Venus", "date_range": ("September 23", "October 22"),
        "decans": [
            {
                "number": 1, "date_range": "September 23 – October 2",
                "date_range_start": 923, "date_range_end": 1002,
                "sub_ruler": "Venus", "sub_sign": "Libra",
                "keywords": ["aesthetic", "peace-loving", "relationship-focused", "clever", "unbalanced"],
                "description_short": (
                    "Venus-pure Libra: the most peace-loving aestheticians of the zodiac. "
                    "Highly aware of every sort of relation to others. Can become very unbalanced "
                    "despite their peace-loving nature. Usually logical and clever, often artistically talented."
                ),
                "description_rich": (
                    "The Venus decan of Libra produces the most peace-loving aestheticians in "
                    "the whole zodiac. These people need to come into contact with the finer "
                    "things in life, and they are highly aware of every imaginable sort of "
                    "relation to their fellow men and women. That said, in spite of their strong "
                    "You-orientation, they can and will at times become very unbalanced and "
                    "quarrelsome. It is a great dilemma in the lives of first decan Libras how "
                    "much to rely on other people, and how much to put their own self above others. "
                    "This is not least shown in partnerships, which tend to dominate their lives. "
                    "They are usually very logical and clever, and often artistically talented."
                ),
            },
            {
                "number": 2, "date_range": "October 3 – October 12",
                "date_range_start": 1003, "date_range_end": 1012,
                "sub_ruler": "Uranus", "sub_sign": "Aquarius",
                "keywords": ["intellectual", "humanitarian", "paradoxical", "detached", "solitary"],
                "description_short": (
                    "Aquarius/Uranus influence: the 'deep' Libras. Fascinated by social and "
                    "humanitarian ideas. Paradoxical romantically — strive for perfect union "
                    "yet need far more space than they expect. Cooler and more frank than typical Libra."
                ),
                "description_rich": (
                    "The Aquarius decan of Libra with rays from Uranus/Saturn might be termed "
                    "the 'deep' Libras. They are immersed in the working of the human mind, and "
                    "very fascinated by the themes of social interaction and humanitarian ideas. "
                    "They are often drawn to higher learning in the most abstract sense. "
                    "Romantically, they can be paradoxical — while they strive to find the "
                    "perfect relationship where everything is shared, time tends to reveal that "
                    "they need a whole lot more space and solitude than they imagined. These "
                    "Libras are cooler and more detached, more frank and less concerned about "
                    "hurting people's feelings than typical Libras."
                ),
            },
            {
                "number": 3, "date_range": "October 13 – October 22",
                "date_range_start": 1013, "date_range_end": 1022,
                "sub_ruler": "Mercury", "sub_sign": "Gemini",
                "keywords": ["restless", "romantic", "versatile", "communicative", "lighthearted"],
                "description_short": (
                    "Gemini/Mercury influence: the most restless Librans. One of the most "
                    "versatile of all 36 decans. Lives for communication; needs one special "
                    "intimate with whom to share every impulse. Among the most lighthearted "
                    "and fun of all zodiac children."
                ),
                "description_rich": (
                    "The Gemini decan of Libra with rays from Mercury is the most restless of "
                    "Librans. The natural polarity and ambivalence of Libra, especially "
                    "romantically, is heightened here. They may live their entire life in search "
                    "of the elusive, perfect romance. Gemini decan Libras are great with people — "
                    "intuitive and highly logical; this is one of the most versatile of all decans "
                    "in the zodiac. They live for communication, and more than others truly need "
                    "one special intimate friend, relative, wife, husband or lover with whom to "
                    "share any impulse, feeling or idea. When in the right mood, they can be among "
                    "the most lighthearted and fun of all zodiac children, with a subtle sense of "
                    "humour and a very acute, mobile intellect."
                ),
            },
        ],
    },

    "scorpio": {
        "sign": "Scorpio", "symbol": "♏", "element": "Water", "modality": "Fixed",
        "ruling_planet": "Pluto/Mars", "date_range": ("October 23", "November 21"),
        "decans": [
            {
                "number": 1, "date_range": "October 23 – November 2",
                "date_range_start": 1023, "date_range_end": 1102,
                "sub_ruler": "Pluto/Mars", "sub_sign": "Scorpio",
                "keywords": ["intense", "passionate", "collected", "driven", "locomotive"],
                "description_short": (
                    "Pluto/Mars-pure Scorpio: the intensity decan above all. Cool and collected "
                    "on the outside, a steaming locomotive beneath. All experiences relate to "
                    "the highs and lows of life. More cognitively driven than most Scorpios."
                ),
                "description_rich": (
                    "The first, pure Scorpio decan influenced by Pluto/Mars is the intensity "
                    "decan above all. Dramatic feelings of either approval or rejection strike "
                    "the hearts of these people at the very moment they encounter something new, "
                    "and they seldom let reason change their mind. For these people, all experiences "
                    "will in some way relate to the highs and lows of life: pain, joy, death, sex, "
                    "love and general mesmerization. They can be cool, collected and seemingly "
                    "unaffected on the outside, yet beneath is a steaming locomotive of feeling, "
                    "purpose and desire. Also when they're more cognitively driven than most "
                    "Scorpios, and irrespective of how introvert or quiet they seem, there will be "
                    "an unusually passionate intensity to the responses."
                ),
            },
            {
                "number": 2, "date_range": "November 3 – November 12",
                "date_range_start": 1103, "date_range_end": 1112,
                "sub_ruler": "Neptune", "sub_sign": "Pisces",
                "keywords": ["romantic", "seductive", "manipulative", "authentic-seeking", "subtle"],
                "description_short": (
                    "Pisces/Neptune influence: subtle minds and a plethora of all feelings. "
                    "Seek what is real and authentic — will sacrifice worldly comfort for beliefs. "
                    "Cunning and mysterious, not above manipulation. Giving and attentive lovers."
                ),
                "description_rich": (
                    "The Pisces decan of Scorpio gives subtle minds and a plethora of all "
                    "feelings imaginable. These people seek what is real and authentic, and will "
                    "sacrifice worldly comforts and prestige for what they believe in. Cunning "
                    "and mysterious, they will not hesitate to manipulate people if necessary. "
                    "They're very romantic and seductive, and thrive in an atmosphere of hidden "
                    "meanings and elusive hints. Sometimes they repel people through their "
                    "alternating self-righteousness and great personal sensitivity. They can be "
                    "shy and retiring, but tend to get what they want in every case. Giving and "
                    "attentive lovers."
                ),
            },
            {
                "number": 3, "date_range": "November 13 – November 21",
                "date_range_start": 1113, "date_range_end": 1121,
                "sub_ruler": "Moon", "sub_sign": "Cancer",
                "keywords": ["emotionally-driven", "transformative", "protective", "crafty", "deeply-feeling"],
                "description_short": (
                    "Cancer/Moon influence: great emotional integrity, trusting every feeling. "
                    "Seldom willing to compromise against cold reason. Great drive and will power "
                    "for a cause. Extremely crafty and cunning; protective and caring."
                ),
                "description_rich": (
                    "Here in the third and last lunar decan of Scorpio the influence produces "
                    "people of great emotional integrity, trusting every feeling they have and "
                    "seldom willing to compromise, at least against any cold dead reason. They "
                    "have great drive and will power if they believe in a cause, and can overcome "
                    "potential feelings of inferiority. At heart they want dramatic emotional "
                    "transformation, and a partner to connect with intimately and deeply. Very "
                    "protective and caring. They are extremely crafty and cunning, with a knack "
                    "for getting to the heart of any matter."
                ),
            },
        ],
    },

    "sagittarius": {
        "sign": "Sagittarius", "symbol": "♐", "element": "Fire", "modality": "Mutable",
        "ruling_planet": "Jupiter", "date_range": ("November 22", "December 21"),
        "decans": [
            {
                "number": 1, "date_range": "November 22 – December 2",
                "date_range_start": 1122, "date_range_end": 1202,
                "sub_ruler": "Jupiter", "sub_sign": "Sagittarius",
                "keywords": ["adventurous", "non-conformist", "risk-taking", "direct", "broad-learner"],
                "description_short": (
                    "Jupiter-pure Sagittarius: the non-conformist who often becomes a respected "
                    "citizen. Adventurous, positive and very direct — in fact rather tactless. "
                    "Sweeping, broad learners and youthful eternal students."
                ),
                "description_rich": (
                    "The first Jupiter decan of Sagittarius is typically the non-conformist who "
                    "goes on to become a respected citizen with academic or social responsibility. "
                    "These people are adventurous, positive and very direct — in fact rather "
                    "tactless. They're lovers of action but more than often have high intellectual, "
                    "political or artistic ambitions. They are sweeping, broad learners and "
                    "youthful, eternal students. Yet might also be the dogmatic teacher or preacher. "
                    "As partners or lovers they are giving and adventurous, enthusiastic and "
                    "romantic. Jupiter tends to bring these people luck and fortune in life, if "
                    "they refrain from worrying and simply give in to the hands of fate. Also "
                    "they have an inclination and often talent for risk-taking, speculation and gambling."
                ),
            },
            {
                "number": 2, "date_range": "December 3 – December 12",
                "date_range_start": 1203, "date_range_end": 1212,
                "sub_ruler": "Mars", "sub_sign": "Aries",
                "keywords": ["frank", "brave", "blunt", "headstrong", "spiritual-physical"],
                "description_short": (
                    "Aries/Mars influence: completely needs challenge and discovery. Most "
                    "naturally frank of all 36 decans. Headstrong and brave — the soldier of "
                    "the mind and spirit. Can be so blunt that others grow tired."
                ),
                "description_rich": (
                    "This second, Martian decan of Sagittarius completely needs challenge and "
                    "discovery, and may be the most naturally frank and lacking in artifice of "
                    "all zodiac decans. Headstrong and brave, they quickly lose interest in "
                    "whatever fails to inspire them. If these people aren't sports-people, they "
                    "probably have some other channel for the release of their great "
                    "spiritual-physical energy. They are the perfect example of the soldier of "
                    "the mind and spirit, if there is such a thing. Nevertheless they can be so "
                    "blunt and lacking in social nuance that others grow tired. Some don't have "
                    "the patience enough to do anything but venture onto some new exciting project "
                    "and tell everybody about it."
                ),
            },
            {
                "number": 3, "date_range": "December 13 – December 21",
                "date_range_start": 1213, "date_range_end": 1221,
                "sub_ruler": "Sun", "sub_sign": "Leo",
                "keywords": ["showman", "rash", "optimistic", "vain", "sunny"],
                "description_short": (
                    "Leo/Sun influence: the showman or showwoman. Always on the lookout for "
                    "another adventure. Integrity and pride great, but prone to excessive "
                    "risk-taking and rash decisions. Optimism never fades; people are drawn "
                    "to their sunny personalities."
                ),
                "description_rich": (
                    "Here in the Leo decan of Sagittarius we have the showman or woman — one "
                    "who is always on the lookout for another adventure or spontaneous experience. "
                    "Their integrity and pride is great, and still they seem to always stumble "
                    "into the pitfalls of excessive risk-taking, rash decision and impulsive "
                    "action. Quite a few gamblers have Sagittarian/Leo influences. They need to "
                    "aim far and high, and will beyond any doubt experience many great letdowns "
                    "in life, because of the sheer magnitude of their ambitions and dreams. Still "
                    "their optimism never fades completely, and people are drawn to their sunny "
                    "personalities. They may be intellectually conceited and vain."
                ),
            },
        ],
    },

    "capricorn": {
        "sign": "Capricorn", "symbol": "♑", "element": "Earth", "modality": "Cardinal",
        "ruling_planet": "Saturn", "date_range": ("December 22", "January 19"),
        "decans": [
            {
                "number": 1, "date_range": "December 22 – January 2",
                "date_range_start": 1222, "date_range_end": 102,
                "sub_ruler": "Saturn", "sub_sign": "Capricorn",
                "keywords": ["hardy", "determined", "practical", "pillar-of-strength", "inflexible"],
                "description_short": (
                    "Saturn-pure Capricorn: legendary patience and determination. The real "
                    "pillars of strength. Sometimes dictatorial and inflexible, but sweet at "
                    "the core. Practical, realistic, with little time for whims."
                ),
                "description_rich": (
                    "The patience and determination of first decan Capricorns is legendary. "
                    "They aren't nearly as self-confident as people think, but their sheer "
                    "hardiness and capacity in all endeavours is unmatched. They are the real "
                    "pillars of strength to lean against when the winds become storms. While "
                    "sometimes dictatorial and always to some degree inflexible and rigid, they "
                    "are sweet at the core with a great sense of humour. They're practical and "
                    "realistic, with little time for whims and fantasy. Some call them "
                    "materialistic, and many also seek power and influence. The main concern of "
                    "first decan Capricorns is however to make things work effectively for "
                    "themselves and others and to realize their goals."
                ),
            },
            {
                "number": 2, "date_range": "January 3 – January 12",
                "date_range_start": 103, "date_range_end": 112,
                "sub_ruler": "Venus", "sub_sign": "Taurus",
                "keywords": ["patient", "artistic", "thorough", "melancholic", "stoic"],
                "description_short": (
                    "Venus/Taurus influence: very patient and hard-working; will not forsake "
                    "the finer things in life. If something is to be done, it must be done "
                    "properly and to the bitter end. Can be melancholic and pessimistic, "
                    "but usually with a sense of humour."
                ),
                "description_rich": (
                    "The second, Taurus decan of Capricorn is very patient and hard-working, "
                    "but will not forsake relaxation and the finer things in life for "
                    "accomplishment. They may be artistic, and if they feel they have the "
                    "talent, will go about exploring it in a quiet, whole-hearted way that "
                    "compensates for their slow intake of new experiences. These people feel "
                    "that if something is to be done, it must always be done properly and to "
                    "the bitter end. They can be melancholic and pessimistic, but usually with "
                    "a sense of humour. Sometimes they have a tendency to linger too long, or "
                    "act as martyrs for something in their typical stoic, uncompromising way."
                ),
            },
            {
                "number": 3, "date_range": "January 13 – January 19",
                "date_range_start": 113, "date_range_end": 119,
                "sub_ruler": "Mercury", "sub_sign": "Virgo",
                "keywords": ["administrative", "shrewd", "impersonal", "loyal", "results-oriented"],
                "description_short": (
                    "Virgo/Mercury influence: a mark of restlessness and desire for "
                    "functionality. Administrative ability at its highest; shrewd organizational "
                    "skills. More inclined to see work impersonally — wants results more than "
                    "recognition. Loyal and faithful in relations."
                ),
                "description_rich": (
                    "Being born under the Virgo decan of Capricorn is a mark of a certain "
                    "restlessness and a great desire for functionality and effectivity. While "
                    "far from impulsive daredevils, they lack the significant patience of the "
                    "first two Capricorn decans. Administrative ability is at its highest here, "
                    "and they have a great practical intelligence and shrewd organizational "
                    "skills. However they may be more inclined to see work and accomplishment "
                    "more impersonally, wanting results more than recognition. They are loyal "
                    "and faithful in their relations, but not to the detriment of realism and "
                    "a sober attitude. These people are usually not interested in abstractions, "
                    "fantasy and ideals, for they feel the need to care for the more immediate "
                    "tasks at hand."
                ),
            },
        ],
    },

    "aquarius": {
        "sign": "Aquarius", "symbol": "♒", "element": "Air", "modality": "Fixed",
        "ruling_planet": "Uranus/Saturn", "date_range": ("January 20", "February 18"),
        "decans": [
            {
                "number": 1, "date_range": "January 20 – January 29",
                "date_range_start": 120, "date_range_end": 129,
                "sub_ruler": "Uranus/Saturn", "sub_sign": "Aquarius",
                "keywords": ["individualistic", "complex", "free-thinking", "sombre", "calculating"],
                "description_short": (
                    "Uranus/Saturn-pure Aquarius: one of complexity and individualism. "
                    "Free-thinkers and non-conformists with a high moral consciousness. "
                    "Can long for solitude and be sombre while displaying a joyful exterior. "
                    "Want meaningfulness above all else."
                ),
                "description_rich": (
                    "The first decan of Aquarius is one of complexity and individualism. These "
                    "people are free-thinkers and non-conformists, with a high moral consciousness "
                    "and the desire to benefit the community in some way. In spite of being highly "
                    "socialized and group-oriented, they can long for solitude, and be sombre in "
                    "mood and easily depressed while displaying a joyful exterior. You'll almost "
                    "never find one of these people stupid or mentally simple — even with very "
                    "limited education they manage to seem insightful, impartial and reasonable. "
                    "They can be calculating and cold and aren't ideally suited for deep emotional "
                    "commitment. Money and status are seldom a goal in itself. They want "
                    "meaningfulness."
                ),
            },
            {
                "number": 2, "date_range": "January 30 – February 9",
                "date_range_start": 130, "date_range_end": 209,
                "sub_ruler": "Mercury", "sub_sign": "Gemini",
                "keywords": ["alert", "chameleon", "abstract-thinker", "strategic", "lacks-staying-power"],
                "description_short": (
                    "Mercury/Gemini influence: lighter in spirit but lacks staying power. "
                    "Extremely alert and bright — cultural, artistic or scientific chameleons. "
                    "Fascinated by the invisible powers behind social interaction. "
                    "Probably good at strategic games like chess."
                ),
                "description_rich": (
                    "The second, Gemini/Mercury decan of Aquarius is a bit lighter in spirit "
                    "but also lacks staying power. Extremely alert and bright, they can be "
                    "cultural, artistic or scientific chameleons, soaking up and interpreting "
                    "ideas and manners of others with ease. Abstract theory appeals to them, "
                    "and they're fascinated by the invisible powers behind social interaction "
                    "and communication. Some people may find them insensitive or too mentally "
                    "oriented, since they may be at loss relating in others ways than the purely "
                    "intellectual. If not academically schooled, they are probably at least "
                    "fascinated in technology or mechanics. They're probably good at strategic "
                    "board games, such as chess, combining imagination and logical reasoning."
                ),
            },
            {
                "number": 3, "date_range": "February 10 – February 18",
                "date_range_start": 210, "date_range_end": 218,
                "sub_ruler": "Venus", "sub_sign": "Libra",
                "keywords": ["refined", "idealistic", "creative", "narcissistic", "humanitarian"],
                "description_short": (
                    "Venus/Libra influence: refined characters. Appealing to crowds — fine "
                    "statespeople. Highly idealistic and humanitarian. Can be mentally narcissistic. "
                    "Highly creative — many poets and writers under this decan."
                ),
                "description_rich": (
                    "The third, Venus/Libra decan of Aquarius are refined characters. While "
                    "they may lack depth of emotion, they are extremely good with people. "
                    "Appealing to crowds, they make fine statesmen/women and politicians. They "
                    "care about other people's insides and are highly idealistic and humanitarian, "
                    "constantly involved in some cause for the bettering of whatever they believe "
                    "in. These people can exhibit much grace and style, and are well-suited for "
                    "the world of fashion. However, they can be mentally narcissistic and perhaps "
                    "a bit depraved, and easily lose balance over lack of stimulation. They aren't "
                    "the most grounded of people. Highly creative and usually with an artistic "
                    "bent — we see many poets and writers under this decan, since creative "
                    "imagination is abundant."
                ),
            },
        ],
    },

    "pisces": {
        "sign": "Pisces", "symbol": "♓", "element": "Water", "modality": "Mutable",
        "ruling_planet": "Neptune/Jupiter", "date_range": ("February 19", "March 20"),
        "decans": [
            {
                "number": 1, "date_range": "February 19 – February 28",
                "date_range_start": 219, "date_range_end": 228,
                "sub_ruler": "Neptune/Jupiter", "sub_sign": "Pisces",
                "keywords": ["mystical", "psychic", "selfless", "vacillating", "giving"],
                "description_short": (
                    "Neptune/Jupiter-pure Pisces: wanders through life open to every sensation. "
                    "Mystically inclined, frequently psychic or highly intuitive. Naturally "
                    "selfless and giving. Cares deeply for the underdog. Highly creative, "
                    "but vacillating and unreliable."
                ),
                "description_rich": (
                    "First decan Pisceans wander through life like soap bubbles — open to every "
                    "sensation and experience, elusive and sensitive. They are mystically inclined "
                    "and frequently psychic or at least highly intuitive. They care little for "
                    "money, but love beautiful things and comfort, and so may need it anyway. "
                    "That is if they don't become monks, forsaking every thing and resisting "
                    "every passion and worldly craving. They aren't very self-assertive and their "
                    "lack of ego can make people take advantage of them, especially since they "
                    "are naturally very selfless and giving. They care deeply for the underdog. "
                    "Highly creative, but vacillating and unreliable."
                ),
            },
            {
                "number": 2, "date_range": "March 1 – March 9",
                "date_range_start": 301, "date_range_end": 309,
                "sub_ruler": "Moon", "sub_sign": "Cancer",
                "keywords": ["prudent", "loyal", "sweet", "hypochondriac", "chameleon-actor"],
                "description_short": (
                    "Moon/Cancer influence: the most prudent and economical Pisces. Need "
                    "security both financially and spiritually. Among the sweetest and most "
                    "loyal of all decans. May possess the greatest natural acting talent of "
                    "all the zodiac."
                ),
                "description_rich": (
                    "The second, Cancer decan of Pisces with rays from the Moon is the most "
                    "prudent and economical of Pisces decans. These Pisceans need security "
                    "both financially and spiritually and tend to worry too much about "
                    "everything. They are also one of the sweetest and most loyal of all "
                    "decans in the zodiac, sacrificing themselves for loved ones without so "
                    "much as a thought to what they are doing. However, they can also become "
                    "complaining or perhaps leeching individuals, hypochondriacs and generally "
                    "over-sensitive. Their imagination is fertile and they may have the greatest "
                    "natural acting talents of all the zodiac, because of their ability of total "
                    "identification and chameleon imitation."
                ),
            },
            {
                "number": 3, "date_range": "March 10 – March 20",
                "date_range_start": 310, "date_range_end": 320,
                "sub_ruler": "Pluto", "sub_sign": "Scorpio",
                "keywords": ["spiritual", "poetic", "occult-drawn", "paradoxical", "receptive"],
                "description_short": (
                    "Scorpio/Pluto influence: heads full of bizarre ideas they somehow manage "
                    "to rationalize and sublimate. Highly spiritual and poetic; many drawn to "
                    "the occult. Paradoxical — typically more vindictive and jealous than other "
                    "Pisceans. Highly receptive and sensitive."
                ),
                "description_rich": (
                    "Third decan Pisceans may have their heads full of bizarre ideas, but they "
                    "somehow manage to rationalize and sublimate all of them. They are highly "
                    "spiritual and poetic, and many are drawn to the occult. For less hardy "
                    "exemplars it is sometimes too much to take. Often these Pisces are "
                    "paradoxical, and typically more vindictive and jealous than other Pisceans, "
                    "who don't seem to have a drop of bad blood in their body. Third decan "
                    "Pisceans are highly receptive and sensitive but perhaps less so than the "
                    "other decans. Sensing that good and evil is an illusion and that earthly "
                    "life is mere surface, they identify with the whole spectrum of attitudes "
                    "and ethics. They have a tendency to mess with drugs and liquids."
                ),
            },
        ],
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Planetary ruler table (from Reddit images 1 & 2)
# ─────────────────────────────────────────────────────────────────────────────
DECAN_RULERS = {
    "aries":       [("Mars",    "Aries"),       ("Sun",     "Leo"),         ("Jupiter", "Sagittarius")],
    "taurus":      [("Venus",   "Taurus"),      ("Mercury", "Virgo"),       ("Saturn",  "Capricorn")],
    "gemini":      [("Mercury", "Gemini"),      ("Venus",   "Libra"),       ("Uranus",  "Aquarius")],
    "cancer":      [("Moon",    "Cancer"),      ("Pluto",   "Scorpio"),     ("Neptune", "Pisces")],
    "leo":         [("Sun",     "Leo"),         ("Jupiter", "Sagittarius"), ("Mars",    "Aries")],
    "virgo":       [("Mercury", "Virgo"),       ("Saturn",  "Capricorn"),   ("Venus",   "Taurus")],
    "libra":       [("Venus",   "Libra"),       ("Uranus",  "Aquarius"),    ("Mercury", "Gemini")],
    "scorpio":     [("Pluto",   "Scorpio"),     ("Neptune", "Pisces"),      ("Moon",    "Cancer")],
    "sagittarius": [("Jupiter", "Sagittarius"), ("Mars",    "Aries"),       ("Sun",     "Leo")],
    "capricorn":   [("Saturn",  "Capricorn"),   ("Venus",   "Taurus"),      ("Mercury", "Virgo")],
    "aquarius":    [("Uranus",  "Aquarius"),    ("Mercury", "Gemini"),      ("Venus",   "Libra")],
    "pisces":      [("Neptune", "Pisces"),      ("Moon",    "Cancer"),      ("Pluto",   "Scorpio")],
}


# ─────────────────────────────────────────────────────────────────────────────
# Vector modifiers: (intensity, stability, expressiveness, dominance, adaptability)
# Small floats applied on top of base sign trait vectors
# ─────────────────────────────────────────────────────────────────────────────
VECTOR_MODIFIERS = {
    "aries":       [( 0.10,  0.00,  0.05,  0.10, -0.05),
                    ( 0.05, -0.05,  0.05,  0.08, -0.05),
                    ( 0.08, -0.08,  0.12,  0.00,  0.10)],
    "taurus":      [( 0.00,  0.10,  0.05, -0.05,  0.00),
                    ( 0.00,  0.08,  0.05, -0.05,  0.05),
                    ( 0.00,  0.12,  0.00, -0.05, -0.05)],
    "gemini":      [( 0.05,  0.00,  0.10,  0.00,  0.08),
                    ( 0.00,  0.05,  0.08,  0.00,  0.05),
                    ( 0.00,  0.05,  0.05,  0.08, -0.05)],
    "cancer":      [( 0.05,  0.00,  0.10,  0.05,  0.00),
                    ( 0.08,  0.05, -0.05,  0.05,  0.00),
                    ( 0.10, -0.08,  0.08, -0.05,  0.00)],
    "leo":         [( 0.05,  0.05,  0.10,  0.10, -0.05),
                    ( 0.05,  0.05,  0.08,  0.05,  0.05),
                    ( 0.08,  0.00,  0.05,  0.10, -0.05)],
    "virgo":       [( 0.00,  0.05, -0.05, -0.05,  0.08),
                    ( 0.00,  0.10, -0.08,  0.05, -0.08),
                    ( 0.00,  0.05,  0.05, -0.08,  0.00)],
    "libra":       [( 0.00,  0.05,  0.10, -0.08,  0.05),
                    ( 0.00,  0.05,  0.00, -0.05,  0.05),
                    ( 0.05,  0.00,  0.12, -0.05,  0.10)],
    "scorpio":     [( 0.12,  0.08, -0.10,  0.10, -0.08),
                    ( 0.10,  0.00, -0.05,  0.08,  0.00),
                    ( 0.08,  0.08, -0.05,  0.00,  0.05)],
    "sagittarius": [( 0.08, -0.05,  0.10,  0.00,  0.12),
                    ( 0.08,  0.00,  0.05,  0.08,  0.05),
                    ( 0.10, -0.05,  0.08,  0.05, -0.05)],
    "capricorn":   [( 0.00,  0.12, -0.05,  0.08, -0.08),
                    ( 0.00,  0.10,  0.00,  0.05, -0.05),
                    ( 0.00,  0.05,  0.00,  0.05,  0.08)],
    "aquarius":    [( 0.05,  0.05,  0.00,  0.05,  0.08),
                    ( 0.05,  0.00,  0.08,  0.05,  0.05),
                    ( 0.05, -0.05,  0.10, -0.05,  0.10)],
    "pisces":      [( 0.05, -0.05,  0.10, -0.08,  0.08),
                    ( 0.08,  0.00,  0.05, -0.08,  0.00),
                    ( 0.08, -0.08,  0.05,  0.00,  0.10)],
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_decan(sign: str, birth_date: _date) -> dict:
    sign_data = DECANS.get(sign.lower())
    if not sign_data:
        raise ValueError(f"Unknown sign: '{sign}'")
    mmdd = birth_date.month * 100 + birth_date.day
    for decan in sign_data["decans"]:
        start, end = decan["date_range_start"], decan["date_range_end"]
        if start > end:  # year-wrap (Capricorn)
            if mmdd >= start or mmdd <= end:
                return decan
        else:
            if start <= mmdd <= end:
                return decan
    return sign_data["decans"][0]


def get_decan_modifier(sign: str, birth_date: _date) -> dict:
    sign_lower = sign.lower()
    decan = get_decan(sign_lower, birth_date)
    num = decan["number"]
    m = VECTOR_MODIFIERS[sign_lower][num - 1]
    return {
        "decan_number":       num,
        "sub_ruler":          decan["sub_ruler"],
        "sub_sign":           decan["sub_sign"],
        "keywords":           decan["keywords"],
        "description_short":  decan["description_short"],
        "description_rich":   decan["description_rich"],
        "vector_modifier": {
            "intensity":      m[0],
            "stability":      m[1],
            "expressiveness": m[2],
            "dominance":      m[3],
            "adaptability":   m[4],
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Self-test
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from datetime import date
    tests = [
        ("pisces",      date(1990, 3, 15)),   # Alex Chen  → D2 Moon/Cancer
        ("leo",         date(1995, 8, 22)),   # Jordan Lee → D3 Mars/Aries
        ("scorpio",     date(1988, 11, 5)),   # → D2 Neptune/Pisces
        ("aries",       date(2000, 4, 1)),    # → D2 Sun/Leo
        ("capricorn",   date(1985, 1, 5)),    # → D2 Venus/Taurus
        ("sagittarius", date(1992, 12, 8)),   # → D2 Mars/Aries
        ("aquarius",    date(2001, 2, 14)),   # → D2 Mercury/Gemini
    ]
    for sign, dob in tests:
        m = get_decan_modifier(sign, dob)
        print(f"\n{sign.title()} {dob} → Decan {m['decan_number']} ({m['sub_ruler']} / {m['sub_sign']})")
        print(f"  Keywords : {', '.join(m['keywords'])}")
        print(f"  Modifiers: {m['vector_modifier']}")
        print(f"  Rich (80): {m['description_rich'][:80]}...")
