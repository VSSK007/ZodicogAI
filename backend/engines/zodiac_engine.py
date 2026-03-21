from functools import lru_cache

ZODIAC_RANGES = [
    ("Capricorn", (12, 22), (1, 19)),
    ("Aquarius", (1, 20), (2, 18)),
    ("Pisces", (2, 19), (3, 20)),
    ("Aries", (3, 21), (4, 19)),
    ("Taurus", (4, 20), (5, 20)),
    ("Gemini", (5, 21), (6, 20)),
    ("Cancer", (6, 21), (7, 22)),
    ("Leo", (7, 23), (8, 22)),
    ("Virgo", (8, 23), (9, 22)),
    ("Libra", (9, 23), (10, 22)),
    ("Scorpio", (10, 23), (11, 21)),
    ("Sagittarius", (11, 22), (12, 21)),
]

ZODIAC_METADATA = {
    "Aries": {"element": "Fire", "modality": "Cardinal"},
    "Taurus": {"element": "Earth", "modality": "Fixed"},
    "Gemini": {"element": "Air", "modality": "Mutable"},
    "Cancer": {"element": "Water", "modality": "Cardinal"},
    "Leo": {"element": "Fire", "modality": "Fixed"},
    "Virgo": {"element": "Earth", "modality": "Mutable"},
    "Libra": {"element": "Air", "modality": "Cardinal"},
    "Scorpio": {"element": "Water", "modality": "Fixed"},
    "Sagittarius": {"element": "Fire", "modality": "Mutable"},
    "Capricorn": {"element": "Earth", "modality": "Cardinal"},
    "Aquarius": {"element": "Air", "modality": "Fixed"},
    "Pisces": {"element": "Water", "modality": "Mutable"},
}

TRAIT_VECTORS = {
    "Aries": {"intensity": 8, "stability": 5, "expressiveness": 7, "dominance": 8, "adaptability": 6},
    "Taurus": {"intensity": 6, "stability": 9, "expressiveness": 4, "dominance": 6, "adaptability": 4},
    "Gemini": {"intensity": 6, "stability": 4, "expressiveness": 9, "dominance": 5, "adaptability": 9},
    "Cancer": {"intensity": 8, "stability": 6, "expressiveness": 6, "dominance": 4, "adaptability": 5},
    "Leo": {"intensity": 9, "stability": 7, "expressiveness": 8, "dominance": 9, "adaptability": 6},
    "Virgo": {"intensity": 5, "stability": 8, "expressiveness": 4, "dominance": 5, "adaptability": 6},
    "Libra": {"intensity": 6, "stability": 6, "expressiveness": 7, "dominance": 5, "adaptability": 8},
    "Scorpio": {"intensity": 9, "stability": 7, "expressiveness": 4, "dominance": 8, "adaptability": 5},
    "Sagittarius": {"intensity": 7, "stability": 5, "expressiveness": 8, "dominance": 6, "adaptability": 9},
    "Capricorn": {"intensity": 7, "stability": 9, "expressiveness": 3, "dominance": 7, "adaptability": 5},
    "Aquarius": {"intensity": 6, "stability": 6, "expressiveness": 6, "dominance": 5, "adaptability": 8},
    "Pisces": {"intensity": 8, "stability": 4, "expressiveness": 7, "dominance": 3, "adaptability": 7},
}


def get_sun_sign(day: int, month: int) -> str:
    for sign, start, end in ZODIAC_RANGES:
        start_month, start_day = start
        end_month, end_day = end

        if start_month == 12:
            if (month == start_month and day >= start_day) or (month == end_month and day <= end_day):
                return sign
        else:
            if (month == start_month and day >= start_day) or \
               (month == end_month and day <= end_day) or \
               (month > start_month and month < end_month):
                return sign

    raise ValueError("Invalid date")


@lru_cache(maxsize=366)
def get_zodiac_profile(day: int, month: int) -> dict:
    import datetime
    from decans_data import get_decan_modifier

    sign = get_sun_sign(day, month)
    metadata = ZODIAC_METADATA[sign]
    base = TRAIT_VECTORS[sign]

    # Keep base vector on 0–10 scale
    tv = {dim: float(base[dim]) for dim in base}

    # Build birth_date (year doesn't matter for decan lookup)
    try:
        birth_date = datetime.date(2000, month, day)
    except ValueError:
        birth_date = datetime.date(2000, month, 28)  # Feb 29 fallback

    # Apply decan vector modifiers (stored as 0–1 fractions, scaled to 0–10), clamped to 0–10
    mod = get_decan_modifier(sign, birth_date)
    vm = mod["vector_modifier"]
    for dim in ("intensity", "stability", "expressiveness", "dominance", "adaptability"):
        tv[dim] = round(max(0.0, min(10.0, tv[dim] + vm[dim] * 10)), 4)

    decan = {
        "number":            mod["decan_number"],
        "date_range":        "",            # not needed at runtime
        "sub_ruler":         mod["sub_ruler"],
        "sub_sign":          mod["sub_sign"],
        "keywords":          mod["keywords"],
        "description_short": mod["description_short"],
        "description_rich":  mod["description_rich"],
        "vector_modifier":   vm,
    }

    return {
        "sign":         sign,
        "element":      metadata["element"],
        "modality":     metadata["modality"],
        "trait_vector": tv,
        "decan":        decan,
    }
