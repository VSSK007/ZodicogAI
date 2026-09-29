export interface Traits {
  intensity: number;
  stability: number;
  expressiveness: number;
  dominance: number;
  adaptability: number;
}

export interface NumerologyCompat {
  compatibility_score: number;
  life_path_score: number;
  expression_score: number;
  cross_score: number;
  pursue_signal: "pursue" | "caution" | "avoid";
}

/** Response of POST /analyze/full — the synastry report's data. */
export interface FullResult {
  vector_similarity_percent: number;
  element_compatibility: string;
  modality_interaction: string;
  zodiac_compatibility_score: number;
  emotional: {
    emotional_compatibility_score: number;
    emotional_expression_similarity: number;
    emotional_intensity_alignment: number;
    emotional_stability_compatibility: number;
  };
  romantic: {
    romantic_compatibility_score: number;
    attachment_pacing_similarity: number;
    affection_expression_similarity: number;
    romantic_polarity_score: number;
  };
  sextrology: {
    sexual_compatibility_score: number;
    intimacy_intensity_alignment: number;
    intimacy_pacing_alignment: number;
    dominance_receptiveness_polarity: number;
    emotional_physical_balance_similarity: number;
  };
  love_style: {
    love_style_compatibility_score: number;
    a_love_style: { dominant_style: string };
    b_love_style: { dominant_style: string };
  };
  love_language: {
    love_language_compatibility_score: number;
    a_love_language: { primary_language: string };
    b_love_language: { primary_language: string };
  };
  numerology_compat: NumerologyCompat;
  relationship_intelligence: {
    overall_score: number;
    stability_prediction: "stable" | "moderate" | "volatile";
    conflict_probability: number;
    strengths: string[];
    risks: string[];
  };
  a_traits: Traits;
  b_traits: Traits;
  analysis: {
    relationship_dynamic: string;
    communication_pattern: string;
    conflict_risk: string;
    long_term_viability: string;
  };
}

/** Who the report is about — saved alongside the result so shared links can show it. */
export interface ReportPersona {
  name: string;
  sign: string;
  mbti?: string;
}

export interface ReportPersonas {
  a: ReportPersona;
  b: ReportPersona;
}
