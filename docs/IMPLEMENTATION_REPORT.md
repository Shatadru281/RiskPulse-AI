# RiskPulse AI implementation report

Initially delivered 2 October 2026; submission packaging updated on 8 October 2026 against the supplied external guidelines.

## 1. What was built

A runnable local financial-risk dashboard implementing the Unified AI/NLP Risk Engine and Module B: Strategic Portfolio Stress Testing. It ingests news and public discussion, emits explainable JSON risk signals, automatically stresses an 18-position synthetic portfolio for impact ≥7, and shows before/after valuation and position losses. Five replayable demos invoke the actual scoring and valuation functions.

## 2. Final architecture

News RSS + social Atom + independent offline adapters → normalized input → cleaning and deduplication → dictionary entities and deterministic NLP → structured signal → REST API and atomic local JSON persistence → dashboard. The impact gate also routes qualifying signals through scenario mapping and position valuation into portfolio analytics. See [architecture.png](architecture.png) and the README Mermaid diagram.

## 3. Technologies

Node.js, strict TypeScript, Next.js 16 App Router, React 19, Tailwind CSS 4, Recharts, Zod, fast-xml-parser, Vitest and ESLint. TypeScript scripts generate the architecture using Sharp and the seven-slide deck using PptxGenJS. No paid API key, Python application runtime, external database or model download is required.

## 4. Files and folders

- `src/app/`: dashboard entry point and eight REST route paths.
- `src/components/`: dashboard, charts, events, evidence and portfolio stress views.
- `src/services/`: ingestion adapters, NLP provider, scenario mapping, valuation and orchestration.
- `src/lib/` and `src/types/`: storage, API errors, formatting, shared contracts and schemas.
- `data/`: news, social, company dictionary and synthetic portfolio fixtures.
- `tests/`: four Vitest suites covering NLP, ingestion, stress and API/persistence.
- `scripts/`: diagram/deck generation and actual HTTP verification.
- `docs/`: methodology, ten-minute submission script, optional five-minute jury rehearsal, recording guide, Q&A, submission checklist, architecture PNG/SVG, PDF/PPTX deck, Word script, screenshots, computed results and verification record.
- Root: README, MIT license, npm lockfile, `.env.example`, TypeScript and tool configuration, and Git exclusions.

## 5. NLP methodology

Financial phrases receive reproducible weights, with longest-first matching, scoped negation and intensifiers. A tanh transform bounds sentiment to [-1,+1]. Eleven event categories compete on weighted keyword and phrase evidence. A configurable dictionary resolves companies, tickers, countries and institutions. Confidence is a heuristic evidence score, not measured accuracy. The local `AIProvider` is replaceable; external enrichment is not shipped.

## 6. Impact methodology

Impact is category severity + 1.8 × absolute sentiment + urgency + systemic context + entity breadth + source heuristic + 0.5 × confidence − age decay, rounded and clamped to [1,10]. The dashboard exposes each contribution. No random scores or corroboration bonus are used. Full constants and examples are in [METHODOLOGY.md](METHODOLOGY.md).

## 7. Stress methodology

Impact ≥7 creates a category-specific scenario automatically. Strength = impact/10 × (0.35 + 0.65 × absolute sentiment); favorable sentiment reverses the base shocks. Equities use beta and issuer/sector shocks; bonds use duration and relevant spreads; loans subtract incremental EAD × PD × LGD; derivatives use signed DV01 or FX exposure. Each scenario starts independently from the original $100M portfolio. Assumptions are illustrative and uncalibrated.

## 8. Data sources

[BBC business RSS](https://feeds.bbci.co.uk/news/business/rss.xml) and [Reddit finance Atom](https://www.reddit.com/r/finance/.rss), plus ten fictional news items and five fictional social discussions. Both live feeds returned data during verification. Independent automatic fallback was tested with simulated failures; offline mode was also exercised in the browser. Live availability can change. The portfolio and all demo events are synthetic and explicitly labeled.

## 9. Run commands

From this repository folder:

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production, after stopping development:

```bash
npm run build
npm start
```

Validation and asset regeneration:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run verify:api
npm run docs:generate
```

The HTTP verification command needs a running server. The source archive excludes installed dependencies, build artifacts, runtime data, Git internals and environment secrets.

## 10. Tests performed

Unit and integration tests cover sentiment bounds/negation, weighted classification, entities, impact, all five demos, threshold boundaries, scenario strength, each asset valuation formula, reconciliation, API validation, concurrent deduplication, replay, retention limits, corrupt-store recovery and live-feed fallback. Actual HTTP checks exercised the running server. Browser checks covered desktop and mobile layouts, rendered charts, source refresh, demo execution, text analysis, search/empty state and scenario changes. All seven slides were rendered using installed PowerPoint and visually inspected; structural and geometry validators were also run.

## 11. Results

**41 tests passed across four files.** npm install, development startup, production build and startup, TypeScript, lint, formatting and actual HTTP verification passed. npm audit reported zero vulnerabilities at delivery. No warnings or errors appeared in the observed production browser console. The deck validators reported zero findings and zero layout warnings. See [VERIFICATION.md](VERIFICATION.md) for scope and reproducible reference values.

## 12. Limitations

English rule-based NLP and dictionary entities have limited context and coverage. Confidence is uncalibrated; news is not fact-checked. Polling is demand-driven, not streaming. Fixed scenario shocks are educational, not forecasts or production risk parameters. Local JSON supports a single Node process, and no hosted multi-user authentication or deployment hardening is included. Optional semantic clustering, calibrated transformer inference, historical backtesting and Module A are not implemented.

## 13. Manual completion before submission

Candidate name, college and email are populated from the presentation. The public repository uses the required college–candidate–hackathon naming pattern. The remaining work is to record the ten-minute walkthrough, upload it to YouTube as Unlisted, add and verify its viewing URL in README, and submit the final links/deck through the organizers' official form. The supplied guidelines contain no actual deadline or form URL.

## 14. Ten-minute submission video

| Time       | Action                                                       |
| ---------- | ------------------------------------------------------------ |
| 0:00–0:30  | Introduce the candidate, problem and Module B.               |
| 0:30–1:15  | Show README commands and app startup.                        |
| 1:15–2:10  | Explain architecture, sources and synthetic data.            |
| 2:10–3:20  | Run the geopolitical demo and show its scores.               |
| 3:20–4:00  | Explain scoring evidence and structured JSON.                |
| 4:00–5:40  | Show automatic stress, $100M → $93.92M and asset formulas.   |
| 5:40–6:40  | Compare credit downgrade with positive earnings.             |
| 6:40–7:25  | Analyze a new fictional text input.                          |
| 7:25–8:15  | Run the tests and explain implementation choices.            |
| 8:15–9:30  | Explain business value, limitations and next steps.          |
| 9:30–10:00 | Close with repository contents and AI-assistance disclosure. |

Use offline mode. The narration and screen actions are in [DEMO_SCRIPT.md](DEMO_SCRIPT.md), with [recording/upload instructions](RECORDING_GUIDE.md). The [five-minute rehearsal](JURY_PITCH.md) is optional and does not replace the required ten-minute submission video.
