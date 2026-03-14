"""
Decan Engine
============
Thin wrapper over decans_data.py — single source of truth for all decan data.

Public API
----------
    get_decan_profile(sign, day, month) -> dict
        Returns the full decan profile (description_short, description_rich,
        keywords, sub_ruler, sub_sign, vector_modifier, decan_number).

    get_decan(sign, day, month) -> dict          [legacy compat]
        Alias for get_decan_profile.
"""

import datetime
from decans_data import get_decan_modifier


def get_decan_profile(sign: str, day: int, month: int) -> dict:
    """
    Return the full decan profile for a person born on (day, month) under (sign).
    Delegates to decans_data.get_decan_modifier — single source of truth.
    """
    try:
        birth_date = datetime.date(2000, month, day)
    except ValueError:
        birth_date = datetime.date(2000, month, 28)

    mod = get_decan_modifier(sign, birth_date)
    return {
        "decan_number":      mod["decan_number"],
        "sub_sign":          mod["sub_sign"],
        "sub_ruler":         mod["sub_ruler"],
        "keywords":          mod["keywords"],
        "description_short": mod["description_short"],
        "description_rich":  mod["description_rich"],
        "vector_modifier":   mod["vector_modifier"],
        "label":             f"{sign} Decan {mod['decan_number']} ({mod['sub_sign']})",
    }


# Legacy alias used by older callers
get_decan = get_decan_profile
