"""
Recommendation Engine — deterministic gaming/movie/sneaker recommendations.

Logic chain:
    Gaming:   intensity + adaptability → stimulation pref + dominance → competitive pref → genres/titles
    Movies:   expressiveness + intensity → emotional bandwidth + stability → resolution pref → genres
    Sneakers: dominance + expressiveness → statement tendency + intensity → perf vs aesthetic → style

Returns:
    {gaming_genres, gaming_titles, movie_genres, movie_titles,
     sneaker_profile, sneaker_brands, gaming_reasoning, movie_reasoning, sneaker_reasoning,
     trait_vector}
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Recommendation data tables
# ---------------------------------------------------------------------------

_GAMING_PROFILES: list[dict] = [
    {
        "name": "Competitive Dominator",
        "conditions": [("dominance", ">=", 7), ("intensity", ">=", 7)],
        "genres": ["Battle Royale", "Fighting", "FPS Competitive", "MOBA"],
        "titles": ["Street Fighter 6", "Valorant", "Apex Legends", "Tekken 8"],
        "reasoning": "You need to win and you need someone to beat. Cooperative play bores you when there's no ranking on the line.",
    },
    {
        "name": "Story Immersionist",
        "conditions": [("expressiveness", ">=", 7), ("intensity", ">=", 6), ("dominance", "<=", 6)],
        "genres": ["RPG", "Narrative Adventure", "Story-Driven Action", "Visual Novel"],
        "titles": ["Baldur's Gate 3", "God of War Ragnarök", "Disco Elysium", "Cyberpunk 2077"],
        "reasoning": "You play for the feeling. If the story doesn't move you, the game doesn't hold you.",
    },
    {
        "name": "Tactical Strategist",
        "conditions": [("stability", ">=", 7), ("dominance", ">=", 6), ("adaptability", "<=", 6)],
        "genres": ["Turn-Based Strategy", "Tactics", "Grand Strategy", "Tower Defense"],
        "titles": ["XCOM 2", "Civilization VI", "Into the Breach", "Total War: Warhammer III"],
        "reasoning": "You want to outthink, not outreact. Speed matters less than the plan.",
    },
    {
        "name": "Chaos Explorer",
        "conditions": [("adaptability", ">=", 8), ("stability", "<=", 5)],
        "genres": ["Open World Sandbox", "Roguelike", "Survival", "Chaos Sim"],
        "titles": ["Elden Ring", "Hades II", "The Binding of Isaac", "Tears of the Kingdom"],
        "reasoning": "You find the edges of every system. Rules are guidelines until you've broken them all.",
    },
    {
        "name": "Social & Chill",
        "conditions": [("expressiveness", ">=", 7), ("intensity", "<=", 6), ("stability", ">=", 6)],
        "genres": ["Cozy", "Party Games", "Life Sim", "Co-op Adventure"],
        "titles": ["Stardew Valley", "It Takes Two", "Animal Crossing", "Overcooked 2"],
        "reasoning": "Games are a social experience first. The genre matters less than who you're playing with.",
    },
    {
        "name": "Intense Lone Wolf",
        "conditions": [("intensity", ">=", 8), ("expressiveness", "<=", 5)],
        "genres": ["Soulslike", "Horror", "Stealth", "Psychological Thriller"],
        "titles": ["Sekiro", "Elden Ring", "Alien: Isolation", "Prey"],
        "reasoning": "You like difficulty and solitude in roughly equal measure. The challenge is personal.",
    },
]

_MOVIE_PROFILES: list[dict] = [
    {
        "name": "Emotional Catharsis Seeker",
        "conditions": [("expressiveness", ">=", 7), ("intensity", ">=", 7)],
        "genres": ["Drama", "Romantic Drama", "Tearjerker", "Literary Adaptation"],
        "titles": ["Normal People (series)", "Eternal Sunshine", "Marriage Story", "Blue Valentine"],
        "reasoning": "You need films that crack something open. If you don't feel it in your chest, what was the point.",
    },
    {
        "name": "Dark Psychology Fan",
        "conditions": [("intensity", ">=", 8), ("expressiveness", "<=", 6)],
        "genres": ["Psychological Thriller", "Crime", "Neo-Noir", "Mind Bender"],
        "titles": ["Gone Girl", "Nightcrawler", "Black Swan", "Oldboy"],
        "reasoning": "You want to understand what people are capable of — and how close you are to the edge yourself.",
    },
    {
        "name": "Epic World Builder",
        "conditions": [("dominance", ">=", 7), ("stability", ">=", 6)],
        "genres": ["Fantasy Epic", "Sci-Fi", "Historical Drama", "Action Adventure"],
        "titles": ["Dune: Part Two", "Interstellar", "The Dark Knight", "Lawrence of Arabia"],
        "reasoning": "Scale matters to you. Small stakes feel like a waste of runtime.",
    },
    {
        "name": "Indie Thoughtful",
        "conditions": [("stability", ">=", 7), ("adaptability", ">=", 6), ("intensity", "<=", 7)],
        "genres": ["Indie Drama", "Slice of Life", "Mumblecore", "Documentary"],
        "titles": ["Aftersun", "Past Lives", "The Worst Person in the World", "Manchester by the Sea"],
        "reasoning": "Quiet films about specific people doing specific things. You find the universal in the particular.",
    },
    {
        "name": "Adrenaline Seeker",
        "conditions": [("intensity", ">=", 7), ("adaptability", ">=", 7)],
        "genres": ["Action Thriller", "Heist", "War", "Spy"],
        "titles": ["Mad Max: Fury Road", "Heat", "Top Gun: Maverick", "Sicario"],
        "reasoning": "You want to feel the speed. The film should have a pulse.",
    },
    {
        "name": "Darkly Comic Observer",
        "conditions": [("adaptability", ">=", 7), ("expressiveness", ">=", 6), ("intensity", "<=", 7)],
        "genres": ["Dark Comedy", "Satire", "Absurdist", "Black Comedy"],
        "titles": ["The Favourite", "Four Lions", "Sorry to Bother You", "The Lobster"],
        "reasoning": "You find the system funny because the alternative is despair. Good comedy is just honest tragedy.",
    },
]

_SNEAKER_PROFILES: list[dict] = [
    {
        "name": "Statement Collector",
        "conditions": [("expressiveness", ">=", 7), ("dominance", ">=", 7)],
        "style_profile": "Loud colourways, cultural conversation pieces. Shoes as identity.",
        "brands": ["Nike SB", "Jordan Brand", "New Balance Collaborations", "Asics Gel-Kayano 14"],
        "reasoning": "Your footwear announces you before you speak. That's intentional.",
    },
    {
        "name": "Clean Minimalist",
        "conditions": [("stability", ">=", 7), ("expressiveness", "<=", 5)],
        "style_profile": "Tonal fits, no logos, understated craft. Quality over noise.",
        "brands": ["Common Projects", "Veja", "New Balance 574", "Adidas Stan Smith"],
        "reasoning": "You let the cut speak. Logos are for people who need the reference point.",
    },
    {
        "name": "Performance Purist",
        "conditions": [("intensity", ">=", 7), ("stability", ">=", 7)],
        "style_profile": "Functional tech first, style second. Worn with athletic or streetwear.",
        "brands": ["Nike Tech", "On Running", "Salomon XT-6", "Hoka Clifton"],
        "reasoning": "If it doesn't perform, it doesn't belong on your feet. The aesthetic is the function.",
    },
    {
        "name": "Streetwear Archivist",
        "conditions": [("adaptability", ">=", 7), ("expressiveness", ">=", 7)],
        "style_profile": "Deep knowledge of drops and history. Collects for culture, not resale.",
        "brands": ["Stüssy x Nike", "Yeezy", "Supreme collaborations", "Kaws x Jordan"],
        "reasoning": "You know the story behind every silhouette. The shoes are references, not just shoes.",
    },
    {
        "name": "Quiet Luxury",
        "conditions": [("dominance", ">=", 7), ("stability", ">=", 7), ("expressiveness", "<=", 6)],
        "style_profile": "Understated premium. Recognisable only to those who know.",
        "brands": ["Loro Piana", "Bottega Veneta", "Common Projects", "Axel Arigato"],
        "reasoning": "The real flex is that most people don't know what they're looking at.",
    },
    {
        "name": "Eclectic Experimenter",
        "conditions": [("adaptability", ">=", 8), ("stability", "<=", 5)],
        "style_profile": "Never the same look twice. Vintage next to technical. Rules are starting points.",
        "brands": ["Vivienne Westwood", "Salehe Bembury", "Merrell Moab", "Reebok Classics"],
        "reasoning": "You wear what interests you that day. The look is a mood, not a brand identity.",
    },
]

# ---------------------------------------------------------------------------
# Matching logic
# ---------------------------------------------------------------------------

def _score_conditions(conditions: list[tuple], tv: dict) -> float:
    if not conditions:
        return 0.5
    passed = sum(
        1 for field, op, threshold in conditions
        if (op == ">=" and tv.get(field, 5) >= threshold)
        or (op == "<=" and tv.get(field, 5) <= threshold)
    )
    return passed / len(conditions)


def _best_match(profiles: list[dict], tv: dict) -> dict:
    scored = [(p, _score_conditions(p["conditions"], tv)) for p in profiles]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[0][0]


def compute_recommendations(zodiac_profile: dict, mbti_profile: dict | None = None) -> dict:
    """
    Produce gaming, movie, and sneaker recommendations from trait_vector.

    Args:
        zodiac_profile: dict from get_zodiac_profile(), must contain trait_vector.
        mbti_profile:   optional; currently unused but reserved.

    Returns:
        dict with gaming_genres, gaming_titles, movie_genres, movie_titles,
              sneaker_profile, sneaker_brands, *_reasoning, trait_vector.
    """
    tv = zodiac_profile.get("trait_vector", {})

    gaming  = _best_match(_GAMING_PROFILES,  tv)
    movie   = _best_match(_MOVIE_PROFILES,   tv)
    sneaker = _best_match(_SNEAKER_PROFILES, tv)

    return {
        "gaming_profile":   gaming["name"],
        "gaming_genres":    gaming["genres"],
        "gaming_titles":    gaming["titles"],
        "gaming_reasoning": gaming["reasoning"],
        "movie_profile":    movie["name"],
        "movie_genres":     movie["genres"],
        "movie_titles":     movie["titles"],
        "movie_reasoning":  movie["reasoning"],
        "sneaker_profile":  sneaker["style_profile"],
        "sneaker_brands":   sneaker["brands"],
        "sneaker_reasoning": sneaker["reasoning"],
        "trait_vector":     tv,
    }
