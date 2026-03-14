MBTI_TYPES = {
    "INTJ": {
        "name": "Architect",
        "dimensions": {"I": True, "N": True, "T": True, "J": True},
        "trait_vector": {"intensity": 7, "stability": 8, "expressiveness": 3, "dominance": 6, "adaptability": 5}
    },
    "INTP": {
        "name": "Logician",
        "dimensions": {"I": True, "N": True, "T": True, "P": True},
        "trait_vector": {"intensity": 6, "stability": 6, "expressiveness": 3, "dominance": 5, "adaptability": 8}
    },
    "ENTJ": {
        "name": "Commander",
        "dimensions": {"E": True, "N": True, "T": True, "J": True},
        "trait_vector": {"intensity": 8, "stability": 7, "expressiveness": 7, "dominance": 9, "adaptability": 6}
    },
    "ENTP": {
        "name": "Debater",
        "dimensions": {"E": True, "N": True, "T": True, "P": True},
        "trait_vector": {"intensity": 6, "stability": 4, "expressiveness": 8, "dominance": 7, "adaptability": 9}
    },
    "INFJ": {
        "name": "Advocate",
        "dimensions": {"I": True, "N": True, "F": True, "J": True},
        "trait_vector": {"intensity": 8, "stability": 6, "expressiveness": 5, "dominance": 4, "adaptability": 6}
    },
    "INFP": {
        "name": "Mediator",
        "dimensions": {"I": True, "N": True, "F": True, "P": True},
        "trait_vector": {"intensity": 7, "stability": 5, "expressiveness": 6, "dominance": 3, "adaptability": 8}
    },
    "ENFJ": {
        "name": "Protagonist",
        "dimensions": {"E": True, "N": True, "F": True, "J": True},
        "trait_vector": {"intensity": 8, "stability": 6, "expressiveness": 9, "dominance": 6, "adaptability": 7}
    },
    "ENFP": {
        "name": "Campaigner",
        "dimensions": {"E": True, "N": True, "F": True, "P": True},
        "trait_vector": {"intensity": 7, "stability": 4, "expressiveness": 9, "dominance": 5, "adaptability": 9}
    },
    "ISTJ": {
        "name": "Logistician",
        "dimensions": {"I": True, "S": True, "T": True, "J": True},
        "trait_vector": {"intensity": 5, "stability": 9, "expressiveness": 2, "dominance": 6, "adaptability": 4}
    },
    "ISFJ": {
        "name": "Defender",
        "dimensions": {"I": True, "S": True, "F": True, "J": True},
        "trait_vector": {"intensity": 6, "stability": 8, "expressiveness": 4, "dominance": 3, "adaptability": 5}
    },
    "ESTJ": {
        "name": "Executive",
        "dimensions": {"E": True, "S": True, "T": True, "J": True},
        "trait_vector": {"intensity": 7, "stability": 8, "expressiveness": 6, "dominance": 8, "adaptability": 5}
    },
    "ESFJ": {
        "name": "Consul",
        "dimensions": {"E": True, "S": True, "F": True, "J": True},
        "trait_vector": {"intensity": 7, "stability": 7, "expressiveness": 8, "dominance": 5, "adaptability": 6}
    },
    "ISTP": {
        "name": "Virtuoso",
        "dimensions": {"I": True, "S": True, "T": True, "P": True},
        "trait_vector": {"intensity": 5, "stability": 6, "expressiveness": 3, "dominance": 5, "adaptability": 8}
    },
    "ISFP": {
        "name": "Adventurer",
        "dimensions": {"I": True, "S": True, "F": True, "P": True},
        "trait_vector": {"intensity": 6, "stability": 5, "expressiveness": 6, "dominance": 2, "adaptability": 9}
    },
    "ESTP": {
        "name": "Entrepreneur",
        "dimensions": {"E": True, "S": True, "T": True, "P": True},
        "trait_vector": {"intensity": 8, "stability": 4, "expressiveness": 8, "dominance": 8, "adaptability": 9}
    },
    "ESFP": {
        "name": "Entertainer",
        "dimensions": {"E": True, "S": True, "F": True, "P": True},
        "trait_vector": {"intensity": 7, "stability": 4, "expressiveness": 9, "dominance": 4, "adaptability": 9}
    },
}


def get_mbti_profile(mbti_type: str) -> dict:
    mbti_type = mbti_type.upper()

    if mbti_type not in MBTI_TYPES:
        raise ValueError("Invalid MBTI type")

    profile = MBTI_TYPES[mbti_type]

    return {
        "type": mbti_type,
        "name": profile["name"],
        "dimensions": profile["dimensions"],
        "trait_vector": profile["trait_vector"]
    }
