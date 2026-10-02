import { containsPhrase } from "@/lib/text";
import { round } from "@/lib/math";
import { categories, type EventCategory } from "@/types";
export const keywords: Record<EventCategory, Record<string, number>> = {
  Geopolitical: {
    war: 5,
    sanctions: 4,
    "border conflict": 5,
    geopolitical: 5,
    conflict: 3,
    tensions: 2,
    embargo: 4,
  },
  Macroeconomic: {
    "central bank": 5,
    inflation: 3,
    gdp: 3,
    "interest rates": 4,
    "interest rate": 4,
    "rate hike": 4,
    recession: 3,
    unemployment: 2,
  },
  "Credit Event": {
    bankruptcy: 6,
    default: 5,
    defaults: 5,
    downgrade: 4,
    downgraded: 4,
    "credit rating": 4,
    "liquidity concerns": 4,
    "liquidity crisis": 5,
    insolvency: 5,
  },
  "Merger/Acquisition": {
    acquire: 4,
    acquires: 4,
    acquisition: 4,
    merger: 5,
    takeover: 5,
    buyout: 4,
  },
  "Product Launch": {
    launches: 3,
    launch: 3,
    "new product": 5,
    "product launch": 5,
    unveils: 3,
    releases: 2,
  },
  Earnings: {
    earnings: 5,
    revenue: 2,
    "profit guidance": 4,
    "record profit": 4,
    "quarterly results": 4,
    "beats expectations": 3,
  },
  Regulatory: {
    regulator: 4,
    regulatory: 4,
    fine: 3,
    sec: 3,
    compliance: 3,
    "fraud investigation": 5,
    antitrust: 4,
  },
  Cybersecurity: {
    cyberattack: 6,
    ransomware: 6,
    "data breach": 5,
    breach: 3,
    "systems offline": 3,
  },
  "Supply Chain": {
    "factory shutdown": 5,
    "supplier shortage": 5,
    "shipping disruption": 5,
    "supply chain": 4,
    "port closure": 4,
  },
  "Market Event": {
    "stock market": 4,
    "market selloff": 5,
    "global markets": 3,
    volatility: 3,
    "trading halt": 5,
    "share price": 2,
  },
  Other: {},
};
export function classifyEvent(text: string) {
  const normalized = text.replace(/[-–—]/g, " ");
  const scores = categories
    .filter((c) => c !== "Other")
    .map((category) => {
      const terms = Object.entries(keywords[category]).filter(([word]) =>
        containsPhrase(normalized, word),
      );
      return {
        category,
        score: terms.reduce((n, [, w]) => n + w, 0),
        terms: terms.map(([word]) => word),
      };
    })
    .sort((a, b) => b.score - a.score);
  const best = scores[0];
  if (!best.score)
    return {
      category: "Other" as EventCategory,
      confidence: 0.25,
      terms: [],
      scores,
    };
  const second = scores[1].score;
  const confidence = round(
    Math.min(
      0.96,
      0.35 +
        (0.35 * best.score) / (best.score + 4) +
        (0.26 * (best.score - second)) / best.score,
    ),
    3,
  );
  return { category: best.category, confidence, terms: best.terms, scores };
}
