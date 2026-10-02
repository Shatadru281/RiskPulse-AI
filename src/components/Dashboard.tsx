"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  LayoutDashboard,
  Radio,
  ChartNoAxesCombined,
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
  Play,
  RefreshCw,
  Plus,
  X,
  AlertCircle,
  Check,
  LoaderCircle,
} from "lucide-react";
import type { DashboardData, RiskSignal, StoredEvent } from "@/types";
import { money, signed } from "@/lib/format";
import { Badge, Kpi } from "./ui";
import EventFeed from "./EventFeed";
import EventDetails from "./EventDetails";
import RiskCharts from "./RiskCharts";
import StressPanel from "./StressPanel";

async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error ?? "Request failed");
  return value as T;
}
const demoOptions = [
  { id: "geopolitical", label: "Geopolitical conflict" },
  { id: "credit", label: "Credit downgrade" },
  { id: "rates", label: "Central-bank rate hike" },
  { id: "cyber", label: "Cyberattack" },
  { id: "earnings", label: "Positive earnings" },
];
export default function Dashboard() {
  const [data, setData] = useState<DashboardData>();
  const [selectedId, setSelectedId] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [scenario, setScenario] = useState("geopolitical");
  const [mode, setMode] = useState("demo");
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [text, setText] = useState("");
  const [inputType, setInputType] = useState("news");
  const busyRef = useRef(false);
  const refresh = useCallback(async () => {
    const next = await api<DashboardData>("/api/dashboard");
    setData(next);
    setSelectedId((old) =>
      old && next.events.some((e) => e.signal.id === old)
        ? old
        : (next.events.find((e) => e.item.id === "demo-news-geopolitical")
            ?.signal.id ?? next.events[0]?.signal.id),
    );
    setError("");
    return next;
  }, []);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (active && !busyRef.current)
        void refresh().catch((e) => {
          if (active) setError(e.message);
        });
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [refresh]);
  async function action(label: string, operation: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await operation();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  const selected = data?.events.find((e) => e.signal.id === selectedId);
  const result = data?.stressTests.find((s) => s.eventId === selectedId);
  const signals = data?.events.map((e) => e.signal) ?? [];
  const average = signals.length
    ? signals.reduce((v, s) => v + s.sentimentScore, 0) / signals.length
    : 0;
  const runDemo = () =>
    action("Processing demonstration", async () => {
      const response = await api<{ processed: StoredEvent[]; added: number }>(
        "/api/ingest",
        { mode: "demo", scenario },
      );
      await refresh();
      setSelectedId(response.processed[0]?.signal.id);
      const s = response.processed[0]?.signal;
      setNotice(
        `${response.added ? "Demo processed" : "Demo recomputed (no duplicate created)"}: ${s?.eventClassification}, impact ${s?.impactScore.toFixed(1)}. ${s && s.impactScore >= 7 ? "Automatic scenario ready below." : "Below threshold; no automatic stress test."}`,
      );
    });
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          <span>
            RiskPulse <b>AI</b>
            <small>FINANCIAL RISK INTELLIGENCE</small>
          </span>
        </a>
        <div className="workspace-label">
          WORKSPACE <Badge>DEMO</Badge>
        </div>
        <nav aria-label="Main navigation">
          <a className="active" href="#overview">
            <LayoutDashboard size={17} />
            Overview
            <span className="nav-dot" />
          </a>
          <a href="#signals">
            <Radio size={17} />
            Event monitor
          </a>
          <a href="#intelligence">
            <ChartNoAxesCombined size={17} />
            Risk intelligence
          </a>
          <a href="#stress">
            <ShieldCheck size={17} />
            Portfolio stress
          </a>
          <a href="#methodology">
            <BookOpen size={17} />
            Methodology
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span />
            Local engine ready
          </div>
          <p>Campus Hackathon 2026</p>
          <strong>S&P Global & CRISIL</strong>
          <p className="sidebar-disclaimer">
            Educational prototype
            <br />
            Synthetic portfolio · USD
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Risk overview</strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot" />{" "}
            {data ? "Engine connected" : "Connecting"}
            <span className="divider" />
            <span className="avatar">RP</span>
          </div>
        </header>
        <main id="overview">
          <div className="page-heading">
            <div>
              <p className="eyebrow">RISK OPERATIONS / OVERVIEW</p>
              <h1>External signals. Portfolio perspective.</h1>
              <p>
                Real-Time AI Financial Risk Intelligence & Event-Driven
                Portfolio Stress Testing Platform
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setShowAnalyze(!showAnalyze)}
            >
              <Plus size={16} /> Analyze text
            </button>
          </div>
          <div className="demo-banner">
            <div className="demo-banner-copy">
              <span className="banner-symbol">
                <Activity size={20} />
              </span>
              <div>
                <strong>
                  Follow a signal all the way to portfolio impact.
                </strong>
                <p>
                  Run the full pipeline with fictional data. No API keys
                  required.
                </p>
              </div>
            </div>
            <div className="demo-controls">
              <select
                aria-label="Demo scenario"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                {demoOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                className="primary-button"
                disabled={!!busy}
                onClick={runDemo}
              >
                {busy ? (
                  <LoaderCircle className="spin" size={15} />
                ) : (
                  <Play size={15} />
                )}
                Run Demo Scenario
              </button>
            </div>
          </div>
          {showAnalyze && (
            <form
              className="panel analyze-form"
              onSubmit={(e) => {
                e.preventDefault();
                void action("Analyzing text", async () => {
                  const response = await api<RiskSignal>("/api/analyze", {
                    text,
                    sourceType: inputType,
                  });
                  await refresh();
                  setSelectedId(response.id);
                  setNotice(
                    `Text analyzed: ${response.eventClassification}, impact ${response.impactScore}.`,
                  );
                  setShowAnalyze(false);
                });
              }}
            >
              <div className="section-title">
                <h3>Analyze unstructured financial text</h3>
                <button
                  aria-label="Close analyze form"
                  className="icon-button"
                  type="button"
                  onClick={() => setShowAnalyze(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <label htmlFor="analysis-text">
                News excerpt or public discussion
              </label>
              <textarea
                id="analysis-text"
                required
                minLength={10}
                maxLength={12000}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ardent Bank's credit rating was downgraded after severe liquidity concerns…"
              />
              <div className="flex-row">
                <select
                  aria-label="Input source type"
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                >
                  <option value="news">Financial news</option>
                  <option value="social">Public discussion</option>
                </select>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!!busy}
                >
                  Analyze & assess portfolio
                </button>
                <span className="subtle">
                  Stored locally · {text.length}/12,000 characters
                </span>
              </div>
            </form>
          )}
          {error && (
            <div className="alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                onClick={() =>
                  void action("Retrying", async () => {
                    await refresh();
                  })
                }
              >
                Retry
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              <Check size={17} />
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {busy && (
            <div className="processing" role="status">
              <LoaderCircle className="spin" size={15} />
              {busy}…
            </div>
          )}
          {!data ? (
            <div className="loading-state">
              <LoaderCircle size={30} className="spin" />
              <h2>Preparing the risk workspace</h2>
              <p>
                Loading sources, analyzing events and valuing the synthetic
                portfolio.
              </p>
            </div>
          ) : (
            <>
              {data.warning && (
                <div className="alert error">{data.warning}</div>
              )}
              <div className="kpi-grid">
                <Kpi
                  title="Events processed"
                  value={String(signals.length).padStart(2, "0")}
                  foot="Retained, deduplicated signals"
                  tip="Unique events retained in the local store, up to 500."
                />
                <Kpi
                  title="High risk events"
                  value={String(
                    signals.filter((s) => s.impactScore >= 7).length,
                  ).padStart(2, "0")}
                  foot="Impact at or above 7.0"
                  tone="text-negative"
                  tip="Events that automatically generated an independent scenario."
                />
                <Kpi
                  title="Average sentiment"
                  value={signed(average)}
                  foot="Across retained signals"
                  tone={average < 0 ? "text-negative" : "text-positive"}
                  tip="Arithmetic mean of deterministic sentiment scores."
                />
                <Kpi
                  title="Highest impact"
                  value={`${Math.max(0, ...signals.map((s) => s.impactScore)).toFixed(1)}`}
                  foot="Score out of 10.0"
                  tip="Highest heuristic impact score in the event store."
                />
                <Kpi
                  title="Portfolio value"
                  value={money(
                    data.portfolio.reduce((n, p) => n + p.marketValue, 0),
                  )}
                  foot="18 synthetic positions · USD"
                  tip="Original value; each scenario starts from this same baseline."
                />
                <Kpi
                  title="Current stressed loss"
                  value={result ? money(result.loss) : "—"}
                  foot={
                    result
                      ? `${result.lossPct.toFixed(2)}% · selected scenario`
                      : "No scenario for selected event"
                  }
                  tone={
                    result && result.loss > 0
                      ? "text-negative"
                      : "text-positive"
                  }
                  tip="Loss (or negative loss for a gain) in the selected event's independent scenario."
                />
              </div>
              <div className="source-status-bar">
                <div>
                  {data.sources.map((s) => (
                    <span
                      key={s.sourceType}
                      title={`${s.message}. Checked ${s.checkedAt}`}
                    >
                      <span className={`source-dot ${s.mode}`} />
                      {s.sourceType === "news"
                        ? "Financial news"
                        : "Public discussion"}
                      <Badge
                        tone={s.mode === "fallback" ? "warning" : "neutral"}
                      >
                        {s.mode}
                      </Badge>
                    </span>
                  ))}
                </div>
                <div className="feed-refresh">
                  <select
                    aria-label="Feed mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="demo">Offline demo</option>
                    <option value="live">Try live feeds</option>
                  </select>
                  <button
                    className="text-button"
                    disabled={!!busy}
                    onClick={() =>
                      void action("Refreshing both sources", async () => {
                        const r = await api<{ added: number }>("/api/ingest", {
                          mode,
                        });
                        await refresh();
                        setNotice(
                          `Sources refreshed. ${r.added} new signals. Source status shows any demo fallback.`,
                        );
                      })
                    }
                  >
                    <RefreshCw size={14} />
                    Refresh feeds
                  </button>
                </div>
              </div>
              <RiskCharts events={data.events} />
              <EventFeed
                events={data.events}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <EventDetails
                event={selected}
                stress={result}
                busy={!!busy}
                onStress={(id) =>
                  void action("Valuing portfolio", async () => {
                    await api("/api/stress-test", { eventId: id });
                    await refresh();
                    setNotice(
                      "Manual sensitivity ready. It uses the original portfolio baseline.",
                    );
                  })
                }
              />
              <StressPanel result={result} />
              <section id="methodology" className="methodology">
                <div>
                  <BookOpen size={19} />
                  <h2>A clear chain of evidence</h2>
                </div>
                <p>
                  Information → Intelligence → Risk Signal → Scenario →
                  Portfolio Impact → Decision Support
                </p>
                <div className="methodology-columns">
                  <p>
                    <strong>01 / Explainable NLP</strong>Weighted financial
                    phrases, scoped negation and intensifiers produce sentiment.
                    Category evidence and transparent impact factors stay
                    attached to every signal.
                  </p>
                  <p>
                    <strong>02 / Automatic scenarios</strong>Impact ≥ 7 triggers
                    a scenario. Impact sets its strength; sentiment sets
                    direction. Each result is independent, with no cumulative
                    compounding.
                  </p>
                  <p>
                    <strong>03 / Simple valuation</strong>Duration
                    approximations, incremental credit loss, signed DV01 and FX
                    exposures translate illustrative shocks to synthetic
                    portfolio values.
                  </p>
                </div>
                <div className="methodology-footer">
                  <Badge tone="warning">DEMONSTRATION ASSUMPTIONS</Badge>
                  <span>
                    This educational prototype provides decision support
                    illustrations. Scores are uncalibrated. Scenario losses are
                    not forecasts or investment advice.
                  </span>
                  <a href="/api/risk-signals" target="_blank" rel="noreferrer">
                    Explore API <ArrowUpRight size={14} />
                  </a>
                </div>
              </section>
            </>
          )}
          <footer className="page-footer">
            <span>RiskPulse AI · Campus Hackathon 2026</span>
            <span>
              {data
                ? `Last update ${new Date(data.updatedAt).toUTCString()}`
                : "Deterministic local engine"}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
