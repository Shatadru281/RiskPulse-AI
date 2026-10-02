import { describe, it, expect } from "vitest";
import {
  portfolio,
  runStressTest,
  shouldAutoStress,
} from "@/services/stress/stressEngine";
import { mapScenario } from "@/services/stress/scenarioMapper";
import { valuePosition } from "@/services/stress/valuation";
import { riskEngine } from "@/services/nlp/riskEngine";
import { localDemoAdapter } from "@/services/ingestion/localDemoAdapter";
const now = new Date("2026-10-02T12:00:00.000Z");
const signal = riskEngine.analyze(
  localDemoAdapter("news", now, "geopolitical")[0],
  now,
);
const scenario = mapScenario(signal);
describe("scenario mapping", () => {
  it("scales continuously by impact and consumes sentiment", () => {
    expect(
      Math.abs(mapScenario({ ...signal, impactScore: 9.5 }).equityShock),
    ).toBeGreaterThan(
      Math.abs(mapScenario({ ...signal, impactScore: 7 }).equityShock),
    );
    expect(mapScenario({ ...signal, sentimentScore: 0.8 }).direction).toBe(
      "favorable",
    );
    expect(
      mapScenario({ ...signal, sentimentScore: 0.8 }).equityShock,
    ).toBeGreaterThan(0);
  });
  it("triggers at the exact threshold", () => {
    expect(shouldAutoStress({ ...signal, impactScore: 7 })).toBe(true);
    expect(shouldAutoStress({ ...signal, impactScore: 6.9 })).toBe(false);
  });
  it("maps entities to targeted counterparties and sectors", () => {
    const cyber = mapScenario(
      riskEngine.analyze(localDemoAdapter("news", now, "cyber")[0], now),
    );
    expect(cyber.affectedCompanies).toContain("Northstar Technology");
    expect(cyber.affectedSectors).toContain("Technology");
  });
});
describe("valuation formulas", () => {
  it("uses market beta and matching issuer shock only", () => {
    const p = portfolio.find((p) => p.assetType === "Equity")!;
    const s = {
      ...scenario,
      equityShock: -0.1,
      affectedCompanyShock: -0.2,
      affectedCompanies: [p.counterparty],
      sectorShock: -0.04,
    };
    expect(valuePosition(p, s).stressedValue).toBeCloseTo(
      p.marketValue * (1 - 0.1 * p.equityBeta - 0.2),
      2,
    );
    expect(
      valuePosition(p, { ...s, affectedCompanies: [], affectedSectors: [] })
        .stressedValue,
    ).toBeCloseTo(p.marketValue * (1 - 0.1 * p.equityBeta), 2);
  });
  it("applies rate and spread duration to corporates but no spread to government", () => {
    for (const type of ["Corporate Bond", "Government Bond"]) {
      const p = portfolio.find((p) => p.assetType === type)!;
      const s = {
        ...scenario,
        interestRateShock: 0.01,
        creditSpreadShock: 0.02,
      };
      expect(valuePosition(p, s).loss).toBeCloseTo(
        p.marketValue * p.duration * (type === "Corporate Bond" ? 0.03 : 0.01),
        2,
      );
    }
  });
  it("subtracts only incremental expected credit loss and caps PD", () => {
    const p = portfolio[0];
    const s = { ...scenario, defaultProbabilityMultiplier: 1.5 };
    const result = valuePosition(p, s);
    expect(result.loss).toBeCloseTo(p.notional * p.pd * 0.5 * p.lgd, 2);
    expect(result.stressedExpectedLoss).toBeCloseTo(
      p.notional * p.pd * 1.5 * p.lgd,
      2,
    );
    expect(
      valuePosition(
        { ...p, pd: 0.9 },
        { ...s, defaultProbabilityMultiplier: 10 },
      ).stressedExpectedLoss,
    ).toBe(p.notional * p.lgd);
  });
  it("uses signed USD per basis-point DV01 and signed FX exposure", () => {
    const swap = portfolio[14],
      hedge = portfolio[15];
    const s = { ...scenario, interestRateShock: 0.01, fxShock: -0.05 };
    expect(valuePosition(swap, s).loss).toBe(-swap.dv01 * 100);
    expect(valuePosition(hedge, s).loss).toBe(-hedge.dv01 * 100);
    expect(valuePosition(portfolio[16], s).loss).toBe(1e6);
    expect(valuePosition(portfolio[17], s).loss).toBe(-600000);
  });
  it("allows derivative liabilities and floors cash asset values", () => {
    expect(
      valuePosition(
        { ...portfolio[14], marketValue: 0 },
        { ...scenario, interestRateShock: 1 },
      ).stressedValue,
    ).toBeLessThan(0);
    expect(
      valuePosition(portfolio[10], { ...scenario, equityShock: -100 })
        .stressedValue,
    ).toBe(0);
  });
  it("reconciles every position to portfolio totals without compounding", () => {
    const result = runStressTest(signal, portfolio, true, now);
    expect(portfolio).toHaveLength(18);
    expect(result.beforeValue).toBe(100e6);
    expect(result.afterValue).toBeCloseTo(
      result.positions.reduce((n, p) => n + p.stressedValue, 0),
      2,
    );
    expect(result.loss).toBeCloseTo(
      result.positions.reduce((n, p) => n + p.loss, 0),
      2,
    );
    expect(result.loss).toBeGreaterThan(0);
    expect(runStressTest(signal, portfolio, true, now)).toEqual(result);
    expect(runStressTest(signal, []).lossPct).toBe(0);
  });
});
