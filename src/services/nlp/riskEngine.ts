import { NormalizedTextItemSchema, RiskSignalSchema } from "@/types";
import { cleanText, fingerprint } from "@/lib/text";
import { round } from "@/lib/math";
import { scoreSentiment } from "./sentiment";
import { classifyEvent } from "./eventClassifier";
import { extractEntities } from "./entityExtractor";
import { scoreImpact } from "./impactScorer";
import type { AIProvider } from "./types";

export class LocalRiskProvider implements AIProvider {
  name = "Deterministic financial NLP";
  analyze(raw: Parameters<AIProvider["analyze"]>[0], now = new Date()) {
    const item = NormalizedTextItemSchema.parse(raw);
    const text = cleanText(
      item.title && !item.text.startsWith(item.title)
        ? `${item.title}. ${item.text}`
        : item.text,
    );
    const sentiment = scoreSentiment(text);
    const event = classifyEvent(text);
    const entities = extractEntities(text);
    const confidence = round(
      Math.min(
        0.95,
        0.7 * event.confidence +
          0.3 * Math.min(0.95, 0.3 + sentiment.matches * 0.12),
      ),
      3,
    );
    const impact = scoreImpact({
      category: event.category,
      sentiment: sentiment.score,
      text,
      entityCount: entities.entities.length,
      sourceType: item.sourceType,
      confidence,
      publishedAt: item.publishedAt,
      now,
    });
    return RiskSignalSchema.parse({
      id: `sig_${fingerprint(`${item.id}:${text}`).slice(0, 16)}`,
      sourceId: item.id,
      source: item.source,
      sourceType: item.sourceType,
      timestamp: item.publishedAt,
      analyzedAt: now.toISOString(),
      company: entities.company,
      ticker: entities.ticker,
      headline: item.title || cleanText(item.text).slice(0, 150),
      sentimentScore: sentiment.score,
      eventClassification: event.category,
      impactScore: impact.score,
      confidence,
      entities: entities.entities,
      explanation: impact.explanation,
      isDemo: item.isDemo,
      evidence: {
        sentimentTerms: sentiment.terms,
        classificationTerms: event.terms,
        classificationConfidence: event.confidence,
        impactFactors: impact.factors,
      },
      modelVersion: "local-lexicon-v1",
    });
  }
}
export const riskEngine: AIProvider = new LocalRiskProvider();
