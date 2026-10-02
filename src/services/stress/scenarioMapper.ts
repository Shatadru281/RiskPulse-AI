import type { RiskSignal, Scenario, EventCategory } from "@/types";
import companies from "../../../data/company-map.json";
import { round } from "@/lib/math";
type Shocks = Pick<
  Scenario,
  | "equityShock"
  | "interestRateShock"
  | "creditSpreadShock"
  | "fxShock"
  | "affectedCompanyShock"
  | "sectorShock"
  | "defaultProbabilityMultiplier"
>;
const base: Shocks = {
  equityShock: -0.03,
  interestRateShock: 0.0025,
  creditSpreadShock: 0.005,
  fxShock: -0.01,
  affectedCompanyShock: 0,
  sectorShock: 0,
  defaultProbabilityMultiplier: 1.15,
};
export const scenarioAssumptions: Record<EventCategory, Shocks> = {
  Geopolitical: {
    ...base,
    equityShock: -0.1,
    interestRateShock: 0.01,
    creditSpreadShock: 0.015,
    fxShock: -0.05,
    defaultProbabilityMultiplier: 1.6,
  },
  Macroeconomic: {
    ...base,
    equityShock: -0.08,
    interestRateShock: 0.02,
    creditSpreadShock: 0.01,
    fxShock: -0.03,
    defaultProbabilityMultiplier: 1.4,
  },
  "Credit Event": {
    ...base,
    equityShock: -0.04,
    creditSpreadShock: 0.025,
    affectedCompanyShock: -0.2,
    defaultProbabilityMultiplier: 1.5,
  },
  Cybersecurity: {
    ...base,
    equityShock: -0.01,
    interestRateShock: 0,
    creditSpreadShock: 0.004,
    affectedCompanyShock: -0.12,
    sectorShock: -0.04,
    defaultProbabilityMultiplier: 1.3,
  },
  "Supply Chain": {
    ...base,
    affectedCompanyShock: -0.1,
    sectorShock: -0.05,
    defaultProbabilityMultiplier: 1.35,
  },
  Regulatory: {
    ...base,
    affectedCompanyShock: -0.08,
    sectorShock: -0.03,
    defaultProbabilityMultiplier: 1.25,
  },
  "Merger/Acquisition": {
    ...base,
    equityShock: -0.01,
    affectedCompanyShock: -0.06,
    defaultProbabilityMultiplier: 1.1,
  },
  "Product Launch": {
    ...base,
    equityShock: 0,
    interestRateShock: 0,
    creditSpreadShock: 0,
    fxShock: 0,
    affectedCompanyShock: -0.04,
    defaultProbabilityMultiplier: 1.05,
  },
  Earnings: {
    ...base,
    equityShock: -0.02,
    interestRateShock: 0,
    affectedCompanyShock: -0.08,
    defaultProbabilityMultiplier: 1.2,
  },
  "Market Event": {
    ...base,
    equityShock: -0.12,
    creditSpreadShock: 0.01,
    fxShock: -0.025,
    defaultProbabilityMultiplier: 1.3,
  },
  Other: base,
};
export function mapScenario(signal: RiskSignal): Scenario {
  const favorable = signal.sentimentScore > 0.15;
  // Impact controls size. Sentiment controls direction and conviction, not event category.
  const strength = round(
    (signal.impactScore / 10) * (0.35 + 0.65 * Math.abs(signal.sentimentScore)),
    4,
  );
  const sign = favorable ? -1 : 1;
  const b = scenarioAssumptions[signal.eventClassification];
  const affected = companies.filter((c) => signal.entities.includes(c.name));
  return {
    id: `scenario_${signal.id}`,
    eventId: signal.id,
    name: `${signal.eventClassification} ${favorable ? "upside sensitivity" : "stress"}`,
    category: signal.eventClassification,
    direction: favorable ? "favorable" : "adverse",
    strength,
    equityShock: b.equityShock * strength * sign,
    interestRateShock: b.interestRateShock * strength * sign,
    creditSpreadShock: b.creditSpreadShock * strength * sign,
    fxShock: b.fxShock * strength * sign,
    affectedCompanyShock: b.affectedCompanyShock * strength * sign,
    sectorShock: b.sectorShock * strength * sign,
    defaultProbabilityMultiplier:
      1 + (b.defaultProbabilityMultiplier - 1) * strength * sign,
    affectedCompanies: affected.map((c) => c.name),
    affectedSectors: [...new Set(affected.map((c) => c.sector))],
    assumption:
      "DEMONSTRATION ASSUMPTIONS. Synthetic portfolio, parallel shocks and first-order valuation. Independent sensitivity scenario; not a forecast or investment advice.",
  };
}
