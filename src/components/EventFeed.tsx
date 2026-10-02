"use client";
import {
  Search,
  ChevronRight,
  Newspaper,
  MessagesSquare,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import type { StoredEvent } from "@/types";
import { signed, time } from "@/lib/format";
import { Badge, SectionTitle, Tip } from "./ui";
export default function EventFeed({
  events,
  selectedId,
  onSelect,
}: {
  events: StoredEvent[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(0);
  const filtered = [...events]
    .sort((a, b) => b.signal.timestamp.localeCompare(a.signal.timestamp))
    .filter(
      (e) =>
        (source === "all" || e.signal.sourceType === source) &&
        (risk !== "high" || e.signal.impactScore >= 7) &&
        `${e.signal.headline} ${e.signal.company ?? ""} ${e.signal.eventClassification}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const activePage = Math.min(page, pages - 1);
  return (
    <section id="signals">
      <SectionTitle kicker="INFORMATION TO INTELLIGENCE" title="Event monitor">
        <Badge>{events.length} signals</Badge>
      </SectionTitle>
      <div className="panel feed-panel">
        <div className="feed-toolbar">
          <label className="search">
            <Search size={16} />
            <input
              aria-label="Search signals"
              placeholder="Search companies, events, categories…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <select
            aria-label="Filter source"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All sources</option>
            <option value="news">Financial news</option>
            <option value="social">Public discussion</option>
          </select>
          <select
            aria-label="Filter risk"
            value={risk}
            onChange={(e) => {
              setRisk(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All impact levels</option>
            <option value="high">High impact ≥ 7</option>
          </select>
        </div>
        <div className="table-scroll">
          <table className="event-table">
            <thead>
              <tr>
                <th>Source / event</th>
                <th>
                  Sentiment
                  <Tip text="Financial lexicon score from −1 (negative) to +1 (positive)." />
                </th>
                <th>
                  Classification
                  <Tip text="Category with the strongest weighted keyword evidence." />
                </th>
                <th>
                  Impact
                  <Tip text="Explainable heuristic from 1–10. Scores ≥7 automatically trigger a scenario." />
                </th>
                <th>Published</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice(activePage * 6, activePage * 6 + 6)
                .map(({ signal: s }) => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? "selected" : ""}
                  >
                    <td>
                      <div className="event-source">
                        {s.sourceType === "news" ? (
                          <Newspaper size={12} />
                        ) : (
                          <MessagesSquare size={12} />
                        )}{" "}
                        {s.source}{" "}
                        {s.isDemo && (
                          <span className="demo-mini">SYNTHETIC</span>
                        )}
                      </div>
                      <button
                        className="headline-button"
                        onClick={() => onSelect(s.id)}
                      >
                        {s.headline}
                      </button>
                      <div className="event-company">
                        {s.company ?? "Broad market"}
                        {s.ticker && ` · ${s.ticker}`}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`sentiment-number ${s.sentimentScore < -0.05 ? "text-negative" : s.sentimentScore > 0.05 ? "text-positive" : ""}`}
                      >
                        {signed(s.sentimentScore)}
                      </span>
                      <span className="cell-note">
                        {s.sentimentScore < -0.05
                          ? "NEGATIVE"
                          : s.sentimentScore > 0.05
                            ? "POSITIVE"
                            : "NEUTRAL"}
                      </span>
                    </td>
                    <td>
                      <Badge>{s.eventClassification}</Badge>
                    </td>
                    <td>
                      <strong
                        className={s.impactScore >= 7 ? "text-negative" : ""}
                      >
                        {s.impactScore.toFixed(1)}
                      </strong>
                      <span className="out-of"> /10</span>
                      <div className="impact-track">
                        <span
                          className={s.impactScore >= 7 ? "high" : ""}
                          style={{ width: `${s.impactScore * 10}%` }}
                        />
                      </div>
                    </td>
                    <td className="time-cell">
                      {time(s.timestamp)}
                      <span className="cell-note">
                        {s.timestamp.slice(0, 10)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() => onSelect(s.id)}
                        aria-label={`View ${s.headline}`}
                      >
                        <ChevronRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">
              No signals match these filters. Try another company or source.
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            {filtered.length ? activePage * 6 + 1 : 0}–
            {Math.min((activePage + 1) * 6, filtered.length)} of{" "}
            {filtered.length} signals
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={activePage === 0}
              onClick={() => setPage(activePage - 1)}
            >
              <ArrowLeft size={15} />
            </button>
            <span>
              {activePage + 1} / {pages}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={activePage >= pages - 1}
              onClick={() => setPage(activePage + 1)}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
