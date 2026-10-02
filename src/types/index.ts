import { z } from "zod";

export const categories = [
  "Geopolitical",
  "Macroeconomic",
  "Credit Event",
  "Merger/Acquisition",
  "Product Launch",
  "Earnings",
  "Regulatory",
  "Cybersecurity",
  "Supply Chain",
  "Market Event",
  "Other",
] as const;
export const CategorySchema = z.enum(categories);
export type EventCategory = z.infer<typeof CategorySchema>;
export const NormalizedTextItemSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceType: z.enum(["news", "social"]),
  title: z.string().optional(),
  text: z.string().trim().min(3).max(20000),
  url: z
    .url()
    .refine((v) => /^https?:\/\//i.test(v), "Only HTTP(S) links are allowed")
    .optional(),
  publishedAt: z.iso.datetime(),
  author: z.string().optional(),
  isDemo: z.boolean().default(false),
});
export type NormalizedTextItem = z.infer<typeof NormalizedTextItemSchema>;
export const FactorSchema = z.object({
  name: z.string(),
  value: z.number().finite(),
});
export const RiskSignalSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  source: z.string(),
  sourceType: z.enum(["news", "social"]),
  timestamp: z.iso.datetime(),
  analyzedAt: z.iso.datetime(),
  company: z.string().optional(),
  ticker: z.string().optional(),
  headline: z.string(),
  sentimentScore: z.number().min(-1).max(1),
  eventClassification: CategorySchema,
  impactScore: z.number().min(1).max(10),
  confidence: z.number().min(0).max(1),
  entities: z.array(z.string()),
  explanation: z.string(),
  isDemo: z.boolean(),
  evidence: z.object({
    sentimentTerms: z.array(z.string()),
    classificationTerms: z.array(z.string()),
    classificationConfidence: z.number().min(0).max(1),
    impactFactors: z.array(FactorSchema),
  }),
  modelVersion: z.literal("local-lexicon-v1"),
});
export type RiskSignal = z.infer<typeof RiskSignalSchema>;
export const assetTypes = [
  "Corporate Loan",
  "Corporate Bond",
  "Government Bond",
  "Equity",
  "Interest Rate Derivative",
  "FX Derivative",
] as const;
export const PositionSchema = z.object({
  id: z.string(),
  assetName: z.string(),
  assetType: z.enum(assetTypes),
  sector: z.string(),
  country: z.string(),
  counterparty: z.string(),
  marketValue: z.number().finite(),
  notional: z.number().nonnegative(),
  duration: z.number().nonnegative(),
  creditRating: z.string(),
  pd: z.number().min(0).max(1),
  lgd: z.number().min(0).max(1),
  equityBeta: z.number().nonnegative(),
  dv01: z.number().finite(),
  fxExposure: z.number().finite(),
  currency: z.literal("USD"),
});
export type Position = z.infer<typeof PositionSchema>;
export const ScenarioSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  category: CategorySchema,
  direction: z.enum(["adverse", "favorable"]),
  strength: z.number().nonnegative(),
  equityShock: z.number(),
  interestRateShock: z.number(),
  creditSpreadShock: z.number(),
  fxShock: z.number(),
  affectedCompanyShock: z.number(),
  sectorShock: z.number(),
  defaultProbabilityMultiplier: z.number().nonnegative(),
  affectedCompanies: z.array(z.string()),
  affectedSectors: z.array(z.string()),
  assumption: z.string(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;
export const ValuationSchema = PositionSchema.extend({
  stressedValue: z.number(),
  loss: z.number(),
  lossPct: z.number(),
  baselineExpectedLoss: z.number(),
  stressedExpectedLoss: z.number(),
  formula: z.string(),
});
export type Valuation = z.infer<typeof ValuationSchema>;
export const StressResultSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  timestamp: z.iso.datetime(),
  automatic: z.boolean(),
  scenario: ScenarioSchema,
  beforeValue: z.number(),
  afterValue: z.number(),
  loss: z.number(),
  lossPct: z.number(),
  positions: z.array(ValuationSchema),
});
export type StressResult = z.infer<typeof StressResultSchema>;
export const SourceStatusSchema = z.object({
  sourceType: z.enum(["news", "social"]),
  source: z.string(),
  mode: z.enum(["live", "demo", "fallback"]),
  count: z.number(),
  message: z.string(),
  checkedAt: z.iso.datetime(),
});
export type SourceStatus = z.infer<typeof SourceStatusSchema>;
export const StoredEventSchema = z.object({
  item: NormalizedTextItemSchema,
  signal: RiskSignalSchema,
  fingerprint: z.string(),
});
export type StoredEvent = z.infer<typeof StoredEventSchema>;
export const StateSchema = z.object({
  version: z.literal(1),
  events: z.array(StoredEventSchema),
  stressTests: z.array(StressResultSchema),
  sources: z.array(SourceStatusSchema),
  updatedAt: z.iso.datetime(),
  warning: z.string().optional(),
});
export type State = z.infer<typeof StateSchema>;
export interface DashboardData extends State {
  portfolio: Position[];
}

export const AnalyzeSchema = z
  .object({
    text: z.string().trim().min(10).max(12000),
    title: z.string().trim().min(1).max(240).optional(),
    sourceType: z.enum(["news", "social"]).default("news"),
  })
  .strict();
export const demoIds = [
  "geopolitical",
  "credit",
  "rates",
  "cyber",
  "earnings",
] as const;
export const IngestSchema = z
  .object({
    mode: z.enum(["demo", "live"]).default("demo"),
    scenario: z.enum(demoIds).optional(),
  })
  .strict();
export const StressRequestSchema = z
  .object({ eventId: z.string().min(1).max(100) })
  .strict();
