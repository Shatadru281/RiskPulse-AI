# RiskPulse AI: exact five-minute demo

**Real-Time AI Financial Risk Intelligence & Event-Driven Portfolio Stress Testing Platform**

This is an optional short jury rehearsal. The submission video must use the [ten-minute script](DEMO_SCRIPT.md). Before presenting, install dependencies and run `npm run dev`; open http://127.0.0.1:3000. Keep **Offline demo** selected. Have `docs/architecture.png` or slide 3 ready. The narration below uses computed values from `docs/demo-results.json` and rounds them for speech.

## 0:00–0:30 — Problem and overview

Show the dashboard.

Say: “RiskPulse AI translates external information into structured financial risk intelligence and connects it to portfolio impact. We ingest news and public discussion, explain the risk signal, and automatically run Module B portfolio stress tests. Everything you see in this demo is fictional or synthetic, with illustrative assumptions.”

## 0:30–1:00 — Architecture

Show the architecture image or slide 3.

Say: “Both sources pass through one normalized ingestion layer. We clean and deduplicate the text, identify dictionary entities, and run a deterministic financial NLP engine. Its JSON signals feed the dashboard and stress engine. Each live feed has its own offline fallback, so network failure does not interrupt the demonstration.”

## 1:00–2:30 — Run the NLP pipeline

Return to the dashboard. Choose **Geopolitical conflict** and click **Run Demo Scenario**. Wait for the green confirmation. Scroll to **Why this signal?**.

Say: “This fictional headline describes escalating tensions, sanctions and market disruption. Clicking the demo button runs the same TypeScript scoring functions used by the API. Replaying replaces the fixture result without adding a duplicate. We get sentiment around minus 0.98, a Geopolitical classification and impact 9.5 out of 10.”

Point to sentiment terms and impact factors.

Say: “The score is not random. We can see the phrases that contributed, including sanctions and conflict. Impact combines category severity, sentiment magnitude, urgency, systemic context, recognized entities, source weight and recency. Confidence measures rule evidence, not the probability that a claim is true.”

## 2:30–3:30 — Structured risk signal

Expand **Structured API output** or click **Export signal JSON**. Point to source, timestamps, scores, entities and evidence.

Say: “Every signal is machine-readable. Another system can consume the sentiment, category and impact using the risk-signals API. The input text, source and model version remain attached for traceability. Live inputs and fictional fallbacks have distinct labels. The UI offers search and filters, and charts show signal intensity and source coverage.”

## 3:30–4:30 — Automatically triggered stress test

Scroll to **Portfolio impact**. Point to **AUTO-TRIGGERED**, the shocks and before/after chart.

Say: “Impact at or above seven automatically maps to an independent scenario. Here the scaled assumptions are about minus 9.4 percent equities, plus 94 basis points in rates and plus 141 basis points in credit spreads. Our 18-position synthetic portfolio moves from 100 million dollars to about 93.92 million, an illustrative loss of 6.08 million. Each scenario starts from the original portfolio, so these losses are not compounded.”

Point to a corporate bond, a loan and the pay-fixed swap row. Hover or focus an information icon to show its formula.

Say: “Bonds use duration, loans use incremental expected credit loss, and derivatives use signed DV01 or FX sensitivity. The pay-fixed hedge gains when rates rise, which offsets part of the loss.”

## 4:30–5:00 — Business value and boundary

Return to the top, choose **Positive earnings**, and click **Run Demo Scenario**. Point to the confirmation or no-scenario state.

Say: “Positive earnings gives positive sentiment and impact around 5.1, so it stays visible without an automatic stress test. RiskPulse AI connects a headline to explainable financial transmission channels and portfolio exposures. This is a decision-support prototype, not a forecast. Our next steps are labeled financial-model evaluation and historically calibrated scenarios.”

## Recovery cues

- If a feed says **fallback**, explain the deliberate reliability mechanism; use offline mode for the timed presentation.
- If the app has no stored data, its first request seeds both local sources.
- If the server is stopped, restart with `npm run dev` from the repository folder.
- If the score differs from the reference because of age, replay the demo to refresh its simulated timestamp.
- If a judge asks about another source or company, use **Analyze text**. Dictionary entity coverage and rule-based English NLP are explicit limitations.
- The result JSON has exact cents; on-screen KPI figures use compact rounding.
