import { describe, expect, it } from "vitest";
import { scoreSentiment } from "@/services/nlp/sentiment";
import { classifyEvent } from "@/services/nlp/eventClassifier";
import { extractEntities } from "@/services/nlp/entityExtractor";
import { scoreImpact } from "@/services/nlp/impactScorer";
import { riskEngine } from "@/services/nlp/riskEngine";
import { localDemoAdapter } from "@/services/ingestion/localDemoAdapter";
import { RiskSignalSchema } from "@/types";
const now = new Date("2026-10-02T12:00:00.000Z");
describe("financial sentiment", () => {
  it("is deterministic, bounded and negative for bankruptcy", () => {
    const text = "Company files for bankruptcy after severe losses";
    expect(scoreSentiment(text)).toEqual(scoreSentiment(text));
    expect(scoreSentiment(text).score).toBeLessThan(-0.6);
    expect(
      scoreSentiment("bankruptcy ".repeat(100)).score,
    ).toBeGreaterThanOrEqual(-1);
  });
  it("recognizes positive earnings and neutral announcements", () => {
    expect(
      scoreSentiment("Company beats expectations with record profit").score,
    ).toBeGreaterThan(0.6);
    expect(scoreSentiment("The company confirms its meeting date").score).toBe(
      0,
    );
    expect(scoreSentiment("").score).toBe(0);
  });
  it("handles negation with sentence and contrast boundaries", () => {
    expect(scoreSentiment("No bankruptcy is expected").score).toBeGreaterThan(
      0,
    );
    expect(scoreSentiment("Not successful").score).toBeLessThan(0);
    expect(scoreSentiment("No issues. Bankruptcy follows").score).toBeLessThan(
      0,
    );
    expect(
      scoreSentiment("No improvement but losses persist").score,
    ).toBeLessThan(0);
  });
  it("handles intensifiers and phrase overlap", () => {
    expect(scoreSentiment("severe losses").score).toBeLessThan(
      scoreSentiment("losses").score,
    );
    expect(scoreSentiment("slightly improved").score).toBeLessThan(
      scoreSentiment("improved").score,
    );
    expect(scoreSentiment("record profit").matches).toBe(1);
  });
});
describe("weighted event classification", () => {
  it.each([
    ["company files for bankruptcy", "Credit Event"],
    ["central bank unexpectedly raises interest rates", "Macroeconomic"],
    ["sanctions escalate a border conflict", "Geopolitical"],
    ["merger and takeover agreement", "Merger/Acquisition"],
    ["company launches new successful product", "Product Launch"],
    ["quarterly earnings revenue report", "Earnings"],
    ["regulator opens a fraud investigation", "Regulatory"],
    ["ransomware causes a data breach", "Cybersecurity"],
    ["factory shutdown and supplier shortage", "Supply Chain"],
    ["stock market volatility and trading halt", "Market Event"],
    ["routine annual meeting date", "Other"],
  ])("classifies %s", (text, category) =>
    expect(classifyEvent(text).category).toBe(category),
  );
  it("uses weighted evidence across categories and word boundaries", () => {
    expect(
      classifyEvent("revenue weak after bankruptcy default and downgrade")
        .category,
    ).toBe("Credit Event");
    expect(
      classifyEvent("The second section describes rewarding experiences")
        .category,
    ).toBe("Other");
    expect(classifyEvent("earnings bankruptcy").confidence).toBeLessThan(
      classifyEvent("bankruptcy default downgrade").confidence,
    );
  });
});
describe("entity extraction", () => {
  it("extracts companies, tickers, countries and institutions without substrings", () => {
    expect(
      extractEntities("Ardent Bank in India and the Federal Reserve").entities,
    ).toEqual(["Ardent Bank", "India", "Federal Reserve"]);
    expect(extractEntities("$NVDA and MSFT report earnings").entities).toEqual([
      "Microsoft",
      "NVIDIA",
    ]);
    expect(extractEntities("Pineapple shipments").entities).toEqual([]);
  });
});
describe("impact model and complete risk signals", () => {
  const input = {
    category: "Credit Event" as const,
    sentiment: -0.8,
    text: "bankruptcy systemic urgent",
    entityCount: 2,
    sourceType: "news" as const,
    confidence: 0.8,
    publishedAt: now.toISOString(),
    now,
  };
  it("is explainable, deterministic and capped", () => {
    const result = scoreImpact(input);
    expect(result).toEqual(scoreImpact(input));
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.score).toBeCloseTo(
      Math.min(
        10,
        result.factors.reduce((n, f) => n + f.value, 0),
      ),
      1,
    );
    expect(
      scoreImpact({
        ...input,
        sentiment: 1,
        entityCount: 100,
        text: "bankruptcy urgent unexpectedly systemic global contagion",
      }).score,
    ).toBeLessThanOrEqual(10);
  });
  it("decays old evidence and does not amplify future timestamps", () => {
    const recent = scoreImpact(input).score;
    expect(
      scoreImpact({ ...input, publishedAt: "2025-01-01T00:00:00.000Z" }).score,
    ).toBeLessThan(recent);
    expect(
      scoreImpact({ ...input, publishedAt: "2030-01-01T00:00:00.000Z" }).score,
    ).toBe(recent);
  });
  it("runs all five demos through the actual functions", () => {
    const run = (id: string) =>
      riskEngine.analyze(localDemoAdapter("news", now, id)[0], now);
    for (const id of ["credit", "geopolitical", "rates", "cyber"]) {
      const s = run(id);
      expect(RiskSignalSchema.safeParse(s).success).toBe(true);
      expect(s.impactScore).toBeGreaterThanOrEqual(7);
      expect(s.sentimentScore).toBeLessThan(0);
    }
    const earnings = run("earnings");
    expect(earnings.sentimentScore).toBeGreaterThan(0);
    expect(earnings.impactScore).toBeLessThan(7);
    expect(run("product").impactScore).toBeLessThan(run("credit").impactScore);
  });
});
