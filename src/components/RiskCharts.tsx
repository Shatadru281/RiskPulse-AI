"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StoredEvent } from "@/types";
import { SectionTitle, Tip } from "./ui";
const palette = ["#0c7c72", "#153d5a", "#4d8ea3", "#c59749", "#a3b8af"];
export default function RiskCharts({ events }: { events: StoredEvent[] }) {
  const trend = [...events]
    .sort((a, b) => a.signal.timestamp.localeCompare(b.signal.timestamp))
    .slice(-30)
    .map((e, i) => ({
      sequence: i + 1,
      name: e.signal.headline,
      impact: e.signal.impactScore,
      sentiment: e.signal.sentimentScore,
    }));
  const counts = new Map<string, number>();
  events.forEach((e) =>
    counts.set(
      e.signal.eventClassification,
      (counts.get(e.signal.eventClassification) ?? 0) + 1,
    ),
  );
  const distribution = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const sources = ["news", "social"].map((source) => ({
    name: source === "news" ? "Financial news" : "Public discussion",
    count: events.filter((e) => e.signal.sourceType === source).length,
  }));
  return (
    <section id="intelligence">
      <SectionTitle kicker="PATTERNS & COVERAGE" title="Risk intelligence">
        <span className="subtle">
          Retained signals · independent observations
        </span>
      </SectionTitle>
      <div className="charts-grid">
        <div className="panel chart-panel">
          <h3>
            Signal intensity
            <Tip text="Each point is one signal ordered by publication time, not a market-price time series." />
          </h3>
          <div className="chart-legend">
            <span className="legend teal" /> Impact{" "}
            <span className="legend gold" /> Sentiment
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={trend}
                margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c7c72" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#0c7c72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e9ecea"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="sequence"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="impact"
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="sentiment"
                  domain={[-1, 1]}
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#e3e8e5",
                    fontSize: 12,
                  }}
                  labelFormatter={(value) => `Signal ${value}`}
                />
                <Area
                  yAxisId="impact"
                  type="linear"
                  dataKey="impact"
                  name="Impact / 10"
                  stroke="#0c7c72"
                  fill="url(#impactFill)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="sentiment"
                  type="linear"
                  dataKey="sentiment"
                  name="Sentiment"
                  stroke="#c59749"
                  fill="transparent"
                  strokeWidth={1.8}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">
            Publication sequence · impact (left), sentiment (right)
          </p>
        </div>
        <div className="panel chart-panel">
          <h3>Event distribution</h3>
          <p className="subtle chart-subtitle">Signals by category</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                layout="vertical"
                data={distribution.slice(0, 6)}
                margin={{ left: 0, right: 25, top: 8, bottom: 0 }}
              >
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={128}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip cursor={{ fill: "#f3f6f4" }} />
                <Bar
                  dataKey="count"
                  name="Signals"
                  radius={[0, 3, 3, 0]}
                  barSize={13}
                  isAnimationActive={false}
                >
                  {distribution.slice(0, 6).map((row, i) => (
                    <Cell key={row.name} fill={palette[i % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-caption">Six most frequent categories</p>
        </div>
        <div className="panel chart-panel">
          <h3>Source coverage</h3>
          <p className="subtle chart-subtitle">Two information channels</p>
          <div className="source-chart">
            {sources.map((source, i) => (
              <div key={source.name}>
                <div className="source-count">
                  <span>{source.name}</span>
                  <b>{source.count}</b>
                </div>
                <div className="track">
                  <span
                    style={{
                      width: `${events.length ? (source.count / events.length) * 100 : 0}%`,
                      background: palette[i],
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="source-note">
              Source labels stay attached to every signal, including offline
              fallbacks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
