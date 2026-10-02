"use client";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, ShieldCheck } from "lucide-react";
import type { StressResult } from "@/types";
import { downloadJson, money, percent, signed } from "@/lib/format";
import { Badge, SectionTitle, Tip } from "./ui";
export default function StressPanel({ result }: { result?: StressResult }) {
  return (
    <section id="stress">
      <SectionTitle
        kicker="MODULE B · STRATEGIC PORTFOLIO STRESS TESTING"
        title="Portfolio impact"
      >
        <Badge>18 synthetic positions · USD</Badge>
      </SectionTitle>
      {!result ? (
        <div className="panel empty-state">
          <ShieldCheck size={26} />
          <h3>No stress scenario for this signal</h3>
          <p>Select a high-impact event or run a manual sensitivity above.</p>
        </div>
      ) : (
        <div className="panel stress-panel">
          <div className="stress-head">
            <div>
              <div className="flex-row">
                <h3>{result.scenario.name}</h3>
                <Badge
                  tone={
                    result.scenario.direction === "adverse"
                      ? "warning"
                      : "positive"
                  }
                >
                  {result.automatic ? "AUTO-TRIGGERED" : "MANUAL"}
                </Badge>
                <Tip text="A scenario maps a signal to illustrative risk-factor shocks. Each scenario uses the same original portfolio; results are not cumulative." />
              </div>
              <p className="subtle">
                Independent scenario · original portfolio baseline · strength{" "}
                {result.scenario.strength.toFixed(2)}×
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => downloadJson(result, `${result.id}.json`)}
            >
              <Download size={15} /> Export result
            </button>
          </div>
          <div className="stress-summary">
            <div>
              <span>Before stress</span>
              <strong>{money(result.beforeValue)}</strong>
              <small>Synthetic portfolio value</small>
            </div>
            <div>
              <span>After stress</span>
              <strong>{money(result.afterValue)}</strong>
              <small>Estimated stressed value</small>
            </div>
            <div>
              <span>
                {result.loss >= 0 ? "Scenario loss" : "Scenario gain"}
              </span>
              <strong
                className={result.loss >= 0 ? "text-negative" : "text-positive"}
              >
                {money(Math.abs(result.loss))}
              </strong>
              <small>
                {percent(Math.abs(result.lossPct))}{" "}
                {result.loss >= 0 ? "drawdown" : "uplift"}
              </small>
            </div>
            <div className="valuation-chart">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={[
                    { name: "Before", value: result.beforeValue / 1e6 },
                    { name: "After", value: result.afterValue / 1e6 },
                  ]}
                  layout="vertical"
                  margin={{ top: 8, left: 0, right: 8, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    hide
                    domain={[
                      0,
                      (Math.max(result.beforeValue, result.afterValue) / 1e6) *
                        1.05,
                    ]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={40}
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toFixed(2)}M`,
                      "Portfolio value",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    barSize={18}
                    radius={[0, 3, 3, 0]}
                    isAnimationActive={false}
                  >
                    <Cell fill="#153d5a" />
                    <Cell fill="#0c7c72" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="shocks">
            <span className="eyebrow">APPLIED SHOCKS</span>
            <span>
              Equity <b>{signed(result.scenario.equityShock * 100)}%</b>
            </span>
            <span>
              Rates{" "}
              <b>{signed(result.scenario.interestRateShock * 10000, 0)} bp</b>
            </span>
            <span>
              Spreads{" "}
              <b>{signed(result.scenario.creditSpreadShock * 10000, 0)} bp</b>
            </span>
            <span>
              FX <b>{signed(result.scenario.fxShock * 100)}%</b>
            </span>
            <span>
              PD{" "}
              <b>{result.scenario.defaultProbabilityMultiplier.toFixed(2)}×</b>
            </span>
          </div>
          <div className="table-scroll">
            <table className="positions-table">
              <thead>
                <tr>
                  <th>Asset / counterparty</th>
                  <th>Asset class</th>
                  <th>Original value</th>
                  <th>Stressed value</th>
                  <th>Loss / (gain)</th>
                  <th>Loss %</th>
                </tr>
              </thead>
              <tbody>
                {result.positions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.assetName}</strong>
                      <span className="cell-note">{p.counterparty}</span>
                    </td>
                    <td>{p.assetType}</td>
                    <td>{money(p.marketValue, false)}</td>
                    <td>{money(p.stressedValue, false)}</td>
                    <td
                      className={
                        p.loss > 0
                          ? "text-negative"
                          : p.loss < 0
                            ? "text-positive"
                            : ""
                      }
                    >
                      {money(p.loss, false)} <Tip text={p.formula} />
                    </td>
                    <td>{percent(p.lossPct)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td>USD equivalent</td>
                  <td>{money(result.beforeValue, false)}</td>
                  <td>{money(result.afterValue, false)}</td>
                  <td>{money(result.loss, false)}</td>
                  <td>{percent(result.lossPct)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="assumption">{result.scenario.assumption}</p>
        </div>
      )}
    </section>
  );
}
