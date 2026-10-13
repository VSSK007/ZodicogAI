"""
Group chemistry - 3 to 8 people, every pair scored by the same deterministic
pair engines as the full synastry report (no AI per pair), then summarised.

The AI is used once per group, afterwards, to put words to the numbers
(see gemini_client.generate_group_summary); everything in this module is
reproducible from the inputs.
"""
from itertools import combinations

MIN_PEOPLE = 3
MAX_PEOPLE = 8


def pair_score(a: dict, b: dict) -> float:
    """The full report's overall compatibility (0-100) for two people. Engines only, no Gemini."""
    # Imported lazily: agent_controller pulls in the whole engine/LLM stack.
    from agent_controller import FULL_RELATIONSHIP_INTELLIGENCE, _run_engines_only

    ctx = _run_engines_only(FULL_RELATIONSHIP_INTELLIGENCE, a, b)
    return float(ctx["relationship_intelligence"]["overall_score"])


def analyze_group(people: list[dict], scorer=pair_score) -> dict:
    """
    people: [{name, day, month, mbti}, ...] with 3-8 entries.

    Returns the matrix, the per-person averages, the group score and the three
    headline facts (glue person, strongest pair, lowest-scoring pair). Ties are
    broken by position so the result never depends on dict/set ordering.
    """
    n = len(people)
    if not MIN_PEOPLE <= n <= MAX_PEOPLE:
        raise ValueError(f"Add between {MIN_PEOPLE} and {MAX_PEOPLE} people.")

    matrix: list[list[float | None]] = [[None] * n for _ in range(n)]
    pairs = []
    for i, j in combinations(range(n), 2):
        s = round(scorer(people[i], people[j]), 1)
        matrix[i][j] = matrix[j][i] = s
        pairs.append({"a": i, "b": j, "score": s})

    averages = [
        round(sum(s for s in row if s is not None) / (n - 1), 1)
        for row in matrix
    ]
    glue_index = max(range(n), key=lambda k: (averages[k], -k))

    strongest = max(pairs, key=lambda p: (p["score"], -p["a"], -p["b"]))
    spiciest = min(pairs, key=lambda p: (p["score"], p["a"], p["b"]))

    def named(p: dict) -> dict:
        return {**p, "names": [people[p["a"]]["name"], people[p["b"]]["name"]]}

    return {
        "matrix": matrix,
        "pairs": pairs,
        "averages": averages,
        "group_score": round(sum(p["score"] for p in pairs) / len(pairs), 1),
        "glue": {"index": glue_index, "name": people[glue_index]["name"], "average": averages[glue_index]},
        "strongest": named(strongest),
        "spiciest": named(spiciest),
    }
