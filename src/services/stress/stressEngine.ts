import { z } from "zod";
import portfolioData from "../../../data/portfolio.json";
import {
  PositionSchema,
  RiskSignalSchema,
  StressResultSchema,
  type Position,
  type RiskSignal,
} from "@/types";
import { round } from "@/lib/math";
import { mapScenario } from "./scenarioMapper";
import { valuePosition } from "./valuation";
export const portfolio = z.array(PositionSchema).parse(portfolioData);
export const shouldAutoStress = (signal: RiskSignal) => signal.impactScore >= 7;
export function runStressTest(
  raw: RiskSignal,
  positions: Position[] = portfolio,
  automatic = true,
  now = new Date(),
) {
  const signal = RiskSignalSchema.parse(raw);
  const scenario = mapScenario(signal);
  const valued = positions.map((p) =>
    valuePosition(PositionSchema.parse(p), scenario),
  );
  const beforeValue = round(valued.reduce((v, p) => v + p.marketValue, 0));
  const afterValue = round(valued.reduce((v, p) => v + p.stressedValue, 0));
  const loss = round(beforeValue - afterValue);
  return StressResultSchema.parse({
    id: `stress_${signal.id}`,
    eventId: signal.id,
    timestamp: now.toISOString(),
    automatic,
    scenario,
    beforeValue,
    afterValue,
    loss,
    lossPct:
      beforeValue === 0 ? 0 : round((loss / Math.abs(beforeValue)) * 100, 4),
    positions: valued,
  });
}
