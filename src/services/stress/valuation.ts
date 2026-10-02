import type { Position, Scenario, Valuation } from "@/types";
import { clamp, round } from "@/lib/math";
export function valuePosition(p: Position, s: Scenario): Valuation {
  const affected = s.affectedCompanies.includes(p.counterparty);
  const sector = s.affectedSectors.includes(p.sector);
  let delta = 0,
    baselineExpectedLoss = 0,
    stressedExpectedLoss = 0,
    formula = "";
  switch (p.assetType) {
    case "Equity": {
      const targeted = affected
        ? s.affectedCompanyShock
        : sector
          ? s.sectorShock
          : 0;
      delta = p.marketValue * (s.equityShock * p.equityBeta + targeted);
      formula = `MV × (market shock ${round(s.equityShock * 100)}% × beta ${p.equityBeta} + targeted shock ${round(targeted * 100)}%)`;
      break;
    }
    case "Government Bond":
    case "Corporate Bond": {
      const spread = p.assetType === "Corporate Bond" ? s.creditSpreadShock : 0;
      delta = -p.marketValue * p.duration * (s.interestRateShock + spread);
      formula = `−MV × duration ${p.duration} × (rate ${round(s.interestRateShock * 10000)} bp + spread ${round(spread * 10000)} bp)`;
      break;
    }
    case "Corporate Loan": {
      const localEvent = [
        "Credit Event",
        "Cybersecurity",
        "Regulatory",
        "Supply Chain",
        "Earnings",
        "Product Launch",
        "Merger/Acquisition",
      ].includes(s.category);
      const exposureScale = !localEvent || affected ? 1 : sector ? 0.5 : 0.2;
      const stressedPd = clamp(
        p.pd * (1 + (s.defaultProbabilityMultiplier - 1) * exposureScale),
        0,
        1,
      );
      baselineExpectedLoss = p.notional * p.pd * p.lgd;
      stressedExpectedLoss = p.notional * stressedPd * p.lgd;
      delta = -(stressedExpectedLoss - baselineExpectedLoss);
      formula = `−EAD × (stressed PD ${round(stressedPd * 100, 3)}% − base PD ${round(p.pd * 100)}%) × LGD ${p.lgd * 100}%`;
      break;
    }
    case "Interest Rate Derivative":
      delta = p.dv01 * (s.interestRateShock * 10000);
      formula = `Signed DV01 ${p.dv01} USD/bp × rate change ${round(s.interestRateShock * 10000)} bp`;
      break;
    case "FX Derivative":
      delta = p.fxExposure * s.fxShock;
      formula = `Signed foreign exposure ${p.fxExposure} USD × FX shock ${round(s.fxShock * 100)}%`;
  }
  const derivative = p.assetType.endsWith("Derivative");
  const stressedValue = round(
    derivative ? p.marketValue + delta : Math.max(0, p.marketValue + delta),
  );
  const loss = round(p.marketValue - stressedValue);
  return {
    ...p,
    stressedValue,
    loss,
    lossPct:
      p.marketValue === 0
        ? 0
        : round((loss / Math.abs(p.marketValue)) * 100, 4),
    baselineExpectedLoss: round(baselineExpectedLoss),
    stressedExpectedLoss: round(stressedExpectedLoss),
    formula,
  };
}
