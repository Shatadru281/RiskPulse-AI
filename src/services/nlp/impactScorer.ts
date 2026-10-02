import type { EventCategory } from "@/types";
import { clamp, round } from "@/lib/math";
import { containsPhrase } from "@/lib/text";
export const baseSeverity: Record<EventCategory, number> = {
  Geopolitical: 5.4,
  Macroeconomic: 4.8,
  "Credit Event": 5.5,
  "Merger/Acquisition": 3,
  "Product Launch": 1.8,
  Earnings: 2.6,
  Regulatory: 4,
  Cybersecurity: 5,
  "Supply Chain": 4.3,
  "Market Event": 3.8,
  Other: 1,
};
export function scoreImpact(input: {
  category: EventCategory;
  sentiment: number;
  text: string;
  entityCount: number;
  sourceType: "news" | "social";
  confidence: number;
  publishedAt: string;
  now: Date;
}) {
  const urgent = [
    "unexpectedly",
    "urgent",
    "immediately",
    "sudden",
    "escalating",
    "shutdown",
    "ransomware",
    "bankruptcy",
  ].filter((w) => containsPhrase(input.text, w));
  const systemic = [
    "global",
    "systemic",
    "contagion",
    "banking system",
    "central bank",
    "liquidity crisis",
  ].filter((w) => containsPhrase(input.text, w));
  const ageHours = Math.max(
    0,
    (input.now.getTime() - Date.parse(input.publishedAt)) / 3600000,
  );
  const factors = [
    { name: `${input.category} severity`, value: baseSeverity[input.category] },
    {
      name: "Sentiment magnitude",
      value: round(1.8 * Math.abs(input.sentiment), 3),
    },
    {
      name: `Urgency${urgent.length ? `: ${urgent.join(", ")}` : ""}`,
      value: round(Math.min(1, urgent.length * 0.5), 3),
    },
    {
      name: `Systemic context${systemic.length ? `: ${systemic.join(", ")}` : ""}`,
      value: round(Math.min(1, systemic.length * 0.5), 3),
    },
    { name: "Entity breadth", value: Math.min(0.4, input.entityCount * 0.1) },
    {
      name: "Source weight (heuristic)",
      value: input.sourceType === "news" ? 0.2 : -0.1,
    },
    { name: "Evidence confidence", value: round(0.5 * input.confidence, 3) },
    { name: "Recency decay", value: round(-Math.min(1, ageHours / 168), 3) },
  ];
  const score = round(
    clamp(
      factors.reduce((s, f) => s + f.value, 0),
      1,
      10,
    ),
    1,
  );
  return {
    score,
    factors,
    explanation: `Impact ${score}/10: ${input.category} base ${baseSeverity[input.category]}, sentiment magnitude ${round(Math.abs(input.sentiment))}${urgent.length ? `, urgency (${urgent.join(", ")})` : ""}${systemic.length ? `, systemic context (${systemic.join(", ")})` : ""}. Heuristic evidence score, not a probability of loss.`,
  };
}
