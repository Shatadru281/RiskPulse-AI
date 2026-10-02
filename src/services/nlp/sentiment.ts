import { clamp, round } from "@/lib/math";
import type { SentimentResult } from "./types";

// Phrase-first matching prevents counting both "record profit" and "profit".
const lexicon: Record<string, number> = {
  "beats expectations": 2.5,
  "beat expectations": 2.5,
  "record profit": 3,
  "raises guidance": 2.3,
  "strong earnings": 2.5,
  "earnings beat": 2.5,
  "credit upgrade": 2.3,
  successful: 1.8,
  growth: 1.3,
  profit: 1.4,
  surge: 1.8,
  gain: 1.2,
  gains: 1.2,
  recovery: 1.7,
  improved: 1.3,
  improvement: 1.3,
  resilient: 1,
  expansion: 1,
  outperform: 1.6,
  "liquidity concerns": -2.7,
  "liquidity crisis": -3.5,
  "credit downgrade": -3,
  downgraded: -2.8,
  downgrade: -2.8,
  bankruptcy: -3.5,
  default: -3,
  defaults: -3,
  fraud: -3,
  investigation: -1.7,
  sanctions: -2.5,
  war: -3,
  conflict: -2,
  escalating: -1.5,
  "supply chain disruptions": -2,
  disruption: -1.7,
  disruptions: -1.7,
  shortage: -1.6,
  cyberattack: -3,
  ransomware: -3,
  breach: -2.3,
  shutdown: -2.2,
  loss: -1.8,
  losses: -1.8,
  fall: -1.6,
  falls: -1.6,
  plunge: -2.8,
  crisis: -3,
  "misses expectations": -2.4,
  "cuts guidance": -2.5,
  inflation: -0.8,
  "rate hike": -1.3,
  "raises interest rates": -1.8,
  recession: -2.5,
  selloff: -2.5,
  fine: -1.5,
  recall: -2,
  delay: -1.3,
  weak: -1.4,
  uncertainty: -1.3,
};
const negators = new Set([
  "not",
  "no",
  "never",
  "without",
  "denies",
  "denied",
  "avoids",
  "avoided",
  "isn't",
  "didn't",
]);
const intensifiers: Record<string, number> = {
  very: 1.3,
  sharply: 1.4,
  severe: 1.5,
  severely: 1.5,
  significant: 1.3,
  significantly: 1.3,
  slightly: 0.6,
  modest: 0.7,
};
const phrases = Object.entries(lexicon)
  .map(([term, weight]) => ({ term, weight, tokens: term.split(" ") }))
  .sort((a, b) => b.tokens.length - a.tokens.length);

export function scoreSentiment(text: string): SentimentResult {
  const tokens =
    text
      .toLowerCase()
      .replace(/[’]/g, "'")
      .replace(/[-–—]/g, " ")
      .match(/[a-z]+(?:'[a-z]+)?|[.!?;,]/g) ?? [];
  let total = 0;
  const terms: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const hit = phrases.find((p) =>
      p.tokens.every((t, j) => tokens[i + j] === t),
    );
    if (!hit) continue;
    const prior: string[] = [];
    for (let k = i - 1; k >= Math.max(0, i - 3); k--) {
      if (/^[.!?;,]$/.test(tokens[k]) || ["but", "however"].includes(tokens[k]))
        break;
      prior.push(tokens[k]);
    }
    const negated = prior.some((t) => negators.has(t));
    const multiplier = prior.reduce(
      (v, t) => Math.max(v, intensifiers[t] ?? 1),
      1,
    );
    const dampener = prior.some((t) => ["slightly", "modest"].includes(t))
      ? 0.6
      : 1;
    const weight = hit.weight * (negated ? -0.65 : 1) * multiplier * dampener;
    total += weight;
    terms.push(
      `${negated ? "negated " : ""}${hit.term} (${weight > 0 ? "+" : ""}${round(weight)})`,
    );
    i += hit.tokens.length - 1;
  }
  return {
    score: round(
      clamp(Math.tanh(total / (3.5 + 0.45 * terms.length)), -1, 1),
      3,
    ),
    terms,
    matches: terms.length,
  };
}
