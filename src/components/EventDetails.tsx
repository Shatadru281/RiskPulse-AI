"use client";
import { Braces, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import type { StoredEvent, StressResult } from "@/types";
import { downloadJson, signed } from "@/lib/format";
import { Badge, SectionTitle, Tip } from "./ui";
export default function EventDetails({
  event,
  stress,
  onStress,
  busy,
}: {
  event?: StoredEvent;
  stress?: StressResult;
  onStress: (id: string) => void;
  busy: boolean;
}) {
  if (!event) return null;
  const { signal: s, item } = event;
  return (
    <section id="explainability">
      <SectionTitle kicker="TRACEABLE BY DESIGN" title="Why this signal?">
        <button
          className="text-button"
          onClick={() => downloadJson(s, `${s.id}.json`)}
        >
          <Braces size={15} /> Export signal JSON
        </button>
      </SectionTitle>
      <div className="details-grid">
        <div className="panel detail-story">
          <div className="flex-row">
            <Badge tone={s.impactScore >= 7 ? "negative" : "neutral"}>
              {s.impactScore >= 7 ? "HIGH IMPACT" : "MONITORING"}
            </Badge>
            <span className="subtle">
              {s.source} · {s.isDemo ? "Fictional demo" : "Unverified input"}
            </span>
          </div>
          <h3>{s.headline}</h3>
          <p className="full-text">{item.text}</p>
          <div className="entity-row">
            {s.entities.length ? (
              s.entities.map((entity) => <Badge key={entity}>{entity}</Badge>)
            ) : (
              <span className="subtle">No dictionary entities recognized</span>
            )}
          </div>
          <div className="detail-bottom">
            <span>Published {new Date(s.timestamp).toUTCString()}</span>
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer">
                Original source <ExternalLink size={12} />
              </a>
            )}
          </div>
          <details>
            <summary>Structured API output</summary>
            <pre>{JSON.stringify(s, null, 2)}</pre>
          </details>
        </div>
        <div className="panel explanation">
          <div className="explanation-heading">
            <Sparkles size={17} />
            <h3>Evidence & scoring</h3>
            <Tip text="Confidence reflects rule evidence. It is not a calibrated accuracy probability." />
          </div>
          <div className="score-row">
            <span>
              Sentiment{" "}
              <b
                className={
                  s.sentimentScore < 0 ? "text-negative" : "text-positive"
                }
              >
                {signed(s.sentimentScore)}
              </b>
            </span>
            <span>
              Evidence confidence <b>{Math.round(s.confidence * 100)}%</b>
            </span>
          </div>
          <p>
            <strong>Sentiment terms</strong>
            <br />
            {s.evidence.sentimentTerms.join(", ") ||
              "No weighted sentiment terms. Neutral baseline."}
          </p>
          <p>
            <strong>{s.eventClassification}</strong> ·{" "}
            {Math.round(s.evidence.classificationConfidence * 100)}% rule
            confidence
            <br />
            {s.evidence.classificationTerms.join(", ") ||
              "No category-specific phrases."}
          </p>
          <div className="factor-list">
            {s.evidence.impactFactors
              .filter((f) => f.value !== 0)
              .map((f) => (
                <div key={f.name}>
                  <span>{f.name}</span>
                  <b>{signed(f.value)}</b>
                </div>
              ))}
            <div className="factor-total">
              <span>Final impact (clamped 1–10)</span>
              <b>{s.impactScore.toFixed(1)}</b>
            </div>
          </div>
          {stress ? (
            <div className="trigger-note">
              <CheckCircle2 size={16} />
              <span>
                {stress.automatic
                  ? "Automatically triggered"
                  : "Manually requested"}
                : {stress.scenario.name}
              </span>
            </div>
          ) : (
            <div className="no-trigger">
              <p>Impact is below 7. No automatic scenario.</p>
              <button
                className="secondary-button"
                disabled={busy}
                onClick={() => onStress(s.id)}
              >
                Run manual sensitivity
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
