export type { RiskSignal, NormalizedTextItem, EventCategory } from "@/types";
export interface SentimentResult {
  score: number;
  terms: string[];
  matches: number;
}
export interface AIProvider {
  name: string;
  analyze(
    item: import("@/types").NormalizedTextItem,
    now?: Date,
  ): import("@/types").RiskSignal;
}
