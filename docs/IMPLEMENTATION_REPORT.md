# RiskPulse AI implementation report

Delivered 2 October 2026 for the S&P Global & CRISIL Campus Hackathon 2026.

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
- `docs/`: methodology, exact five-minute script, architecture PNG/SVG, presentation, dashboard screenshots, computed results and verification record.
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

Fill candidate name, college email, college/campus and demo-video link in README; fill the three candidate fields on slide 1. If regenerating the deck, update those values in `scripts/generate-presentation.ts` too. Record the five-minute demo, apply any required college/candidate repository naming convention, and publish the source to your own GitHub destination. No public repository or video was created without those details.

## 14. Exact five-minute demo

| Time      | Action                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| 0:00–0:30 | Show the dashboard and explain the problem, synthetic data and Module B.                                         |
| 0:30–1:00 | Show architecture and the two sources with independent fallbacks.                                                |
| 1:00–2:30 | Run **Geopolitical conflict**; explain sentiment −0.982, class and impact 9.5 using the evidence panel.          |
| 2:30–3:30 | Expand **Structured API output**; show machine-readable scores, entities and provenance.                         |
| 3:30–4:30 | Show the automatic scenario, $100M → $93.92M, $6.08M illustrative loss, and individual asset formulas.           |
| 4:30–5:00 | Run **Positive earnings**; show impact 5.1 and no automatic stress, then explain business value and limitations. |

Use offline mode for the timed demonstration. The word-for-word narration and recovery cues are in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).
