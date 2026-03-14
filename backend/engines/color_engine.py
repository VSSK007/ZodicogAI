"""
Color Engine — enriched with aura, classic power, and 2026 power colors.

Sources:
  Aura colors:   yourtango.com/zodiac/color-aura-according-zodiac-sign
  Classic power: yourtango.com/2017309347/power-colors-zodiac-sign-astrology
  2026 power:    yourtango.com/zodiac/zodiac-signs-power-color-2026

Public interface:
    get_color_profile(sign)               -> dict
    compute_color_harmony(sign_a, sign_b) -> dict
"""

import colorsys

# ---------------------------------------------------------------------------
# Zodiac color data
# Each entry carries three color layers:
#   Primary (hex/name/rgb)  = spiritual aura field color
#   power_*                 = classic zodiac archetype power color
#   power_2026              = 2026 cosmic trend color name
# ---------------------------------------------------------------------------

ZODIAC_COLORS: dict[str, dict] = {
    "Aries": {
        "name": "Aura Red",
        "hex":  "#EF4444",
        "rgb":  (239, 68, 68),
        "keywords": ["passion", "courage", "fire", "visibility"],
        "power_name": "Bold Red",
        "power_hex":  "#DC2626",
        "power_rgb":  (220, 38, 38),
        "power_2026": "Sunset Orange",
        "power_meaning": "Red commands attention and drives desire — it fuels Aries' fearless, outspoken nature and bold beginnings.",
    },
    "Taurus": {
        "name": "Emerald Aura",
        "hex":  "#22C55E",
        "rgb":  (34, 197, 94),
        "keywords": ["stability", "growth", "abundance", "grounding"],
        "power_name": "Forest Green",
        "power_hex":  "#16A34A",
        "power_rgb":  (22, 163, 74),
        "power_2026": "Ochre",
        "power_meaning": "Green reflects Taurus's earth energy — nurturing, patient, and abundantly grounded in the heart chakra.",
    },
    "Gemini": {
        "name": "Solar Yellow",
        "hex":  "#EAB308",
        "rgb":  (234, 179, 8),
        "keywords": ["intellect", "joy", "creativity", "brightness"],
        "power_name": "Sunlit Yellow",
        "power_hex":  "#CA8A04",
        "power_rgb":  (202, 138, 4),
        "power_2026": "Honey",
        "power_meaning": "Yellow enhances thought, combats creative block, and channels mercurial energy into authentic expression.",
    },
    "Cancer": {
        "name": "Celestial Blue",
        "hex":  "#60A5FA",
        "rgb":  (96, 165, 250),
        "keywords": ["intuition", "nurturing", "sensitivity", "compassion"],
        "power_name": "Moonlit Silver",
        "power_hex":  "#CBD5E1",
        "power_rgb":  (203, 213, 225),
        "power_2026": "Sand",
        "power_meaning": "Silver is ethereal as moonlight — it deepens Cancer's sensitivity and expands their capacity for love.",
    },
    "Leo": {
        "name": "Radiant Gold",
        "hex":  "#FBBF24",
        "rgb":  (251, 191, 36),
        "keywords": ["royalty", "strength", "radiance", "leadership"],
        "power_name": "Royal Gold",
        "power_hex":  "#D97706",
        "power_rgb":  (217, 119, 6),
        "power_2026": "Deep Ochre",
        "power_meaning": "Gold amplifies Leo's natural fierceness and commands attention through sheer solar radiance.",
    },
    "Virgo": {
        "name": "Teal Clarity",
        "hex":  "#0D9488",
        "rgb":  (13, 148, 136),
        "keywords": ["precision", "healing", "clarity", "analysis"],
        "power_name": "Earthy Sage",
        "power_hex":  "#65A30D",
        "power_rgb":  (101, 163, 13),
        "power_2026": "White",
        "power_meaning": "Sage green keeps Virgo anchored while supporting growth, self-improvement, and the drive to be of service.",
    },
    "Libra": {
        "name": "Rose Aura",
        "hex":  "#F472B6",
        "rgb":  (244, 114, 182),
        "keywords": ["harmony", "beauty", "balance", "love"],
        "power_name": "Blush Pink",
        "power_hex":  "#EC4899",
        "power_rgb":  (236, 72, 153),
        "power_2026": "Champagne",
        "power_meaning": "Pink exudes loving warmth — it enhances Libra's natural charm, social grace, and ecstatic energy.",
    },
    "Scorpio": {
        "name": "Burgundy Aura",
        "hex":  "#9F1239",
        "rgb":  (159, 18, 57),
        "keywords": ["mystery", "transformation", "depth", "magnetism"],
        "power_name": "Obsidian Black",
        "power_hex":  "#09090B",
        "power_rgb":  (9, 9, 11),
        "power_2026": "Honey",
        "power_meaning": "Black protects Scorpio's inner world while amplifying magnetic power — mystery becomes armour.",
    },
    "Sagittarius": {
        "name": "Violet Aura",
        "hex":  "#7C3AED",
        "rgb":  (124, 58, 237),
        "keywords": ["freedom", "wisdom", "exploration", "awareness"],
        "power_name": "Royal Purple",
        "power_hex":  "#9333EA",
        "power_rgb":  (147, 51, 234),
        "power_2026": "Whiskey Brown",
        "power_meaning": "Purple broadens perspective — supporting Sagittarius in absorbing the full spectrum of human experience.",
    },
    "Capricorn": {
        "name": "Deep Crimson Aura",
        "hex":  "#991B1B",
        "rgb":  (153, 27, 27),
        "keywords": ["ambition", "tradition", "discipline", "resilience"],
        "power_name": "Storm Grey",
        "power_hex":  "#6B7280",
        "power_rgb":  (107, 114, 128),
        "power_2026": "Deep Whiskey",
        "power_meaning": "Grey represents tradition and quiet strength — grounding Capricorn's ambition in steady, reliable progress.",
    },
    "Aquarius": {
        "name": "Turquoise Aura",
        "hex":  "#06B6D4",
        "rgb":  (6, 182, 212),
        "keywords": ["innovation", "vision", "creativity", "freedom"],
        "power_name": "Electric Blue",
        "power_hex":  "#2563EB",
        "power_rgb":  (37, 99, 235),
        "power_2026": "Ochre",
        "power_meaning": "Blue soothes Aquarian restlessness and channels scattered energy into focused, radiant creativity.",
    },
    "Pisces": {
        "name": "Teal Aura",
        "hex":  "#2DD4BF",
        "rgb":  (45, 212, 191),
        "keywords": ["healing", "compassion", "intuition", "flow"],
        "power_name": "Celadon Mist",
        "power_hex":  "#86EFAC",
        "power_rgb":  (134, 239, 172),
        "power_2026": "Sunset Brown",
        "power_meaning": "Light green amplifies Pisces' healing gifts — their capacity to bring peace, comfort, and inspiration.",
    },
}

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _blend_rgb(a: tuple, b: tuple) -> tuple[int, int, int]:
    return ((a[0] + b[0]) // 2, (a[1] + b[1]) // 2, (a[2] + b[2]) // 2)


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02X}{g:02X}{b:02X}"


def _complementary_rgb(r: int, g: int, b: int) -> tuple[int, int, int]:
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    h = (h + 0.5) % 1.0
    nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
    return round(nr * 255), round(ng * 255), round(nb * 255)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def get_color_profile(sign: str) -> dict:
    """
    Return the full color profile for a zodiac sign — aura, power, and 2026.
    """
    data = ZODIAC_COLORS.get(sign, ZODIAC_COLORS["Aries"])
    return {
        "name":        data["name"],
        "hex":         data["hex"],
        "rgb":         list(data["rgb"]),
        "keywords":    list(data["keywords"]),
        "power_name":  data["power_name"],
        "power_hex":   data["power_hex"],
        "power_2026":  data["power_2026"],
    }


def compute_color_harmony(sign_a: str, sign_b: str) -> dict:
    a_data = ZODIAC_COLORS.get(sign_a, ZODIAC_COLORS["Aries"])
    b_data = ZODIAC_COLORS.get(sign_b, ZODIAC_COLORS["Aries"])

    mg_rgb   = _blend_rgb(a_data["rgb"], b_data["rgb"])
    comp_rgb = _complementary_rgb(*mg_rgb)

    a_word = a_data["name"].split()[-1]
    b_word = b_data["name"].split()[-1]

    return {
        "a_color":  get_color_profile(sign_a),
        "b_color":  get_color_profile(sign_b),
        "middle_ground": {
            "name": f"Cosmic {a_word}-{b_word} Blend",
            "hex":  _rgb_to_hex(*mg_rgb),
            "rgb":  list(mg_rgb),
        },
        "compatible_color": {
            "name": "Harmonic Bridge",
            "hex":  _rgb_to_hex(*comp_rgb),
            "rgb":  list(comp_rgb),
        },
    }
