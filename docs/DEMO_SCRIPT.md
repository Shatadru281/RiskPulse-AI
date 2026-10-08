# RiskPulse AI ten minute video script

**Presenter:** Shatadru Adhikary, Vellore Institute of Technology

**Submission:** S&P Global & Crisil Campus Hackathon 2026

**Target:** a 10-minute screen recording with your own narration.

Read only the **Say** paragraphs aloud. **Show** instructions are actions, not narration. Rehearse once with a timer. Aim for 115–125 words per minute and use the remaining time for clicks, scrolling and short pauses. Timestamps are pacing targets, not an automatically timed recording. Finish around 10:00.

Before recording, install dependencies and have the README, slide 3, dashboard and a VS Code terminal ready. Use **Offline demo** for repeatability. Keep the script on another device or an uncaptured display. See [RECORDING_GUIDE.md](RECORDING_GUIDE.md).

## 0:00–0:30 Introduction

**Show:** Slide 1, then the dashboard overview.

**Say:** “Hello, I am Shatadru Adhikary from Vellore Institute of Technology. This is RiskPulse AI, my individual submission for the S&P Global and Crisil Campus Hackathon. It turns financial news and public discussions into explainable risk signals, then connects high-impact events to stress tests on a synthetic banking portfolio. I will show the working pipeline, its calculations, and its limitations.”

## 0:30–1:15 Setup and reproducibility

**Show:** README Quickstart in VS Code. Point to clone, install and run commands. With dependencies already installed, start the app using `npm run dev`. If the prepared server is running, show its command and Ready message; do not start a second process on the same port.

**Say:** “The complete project is in this public repository. The README contains the installation and run commands. It uses Node.js and TypeScript. After installing the dependencies with npm install, I start the local server with npm run dev and open localhost on port three thousand.

“No paid API key, model download or external database is needed. The default offline mode loads fictional news and public-discussion examples, so the demonstration is reproducible even without a working feed connection.”

## 1:15–2:10 Architecture and data

**Show:** Slide 3 or `docs/architecture.png`; trace the arrows. Then show the four files in `data/`.

**Say:** “The ingestion layer has separate adapters for BBC business news and Reddit finance discussions. Both produce the same normalized text format. If either feed fails, that source independently switches to its fictional fallback.

“Next, the pipeline cleans the text, removes duplicate content and identifies entities from a configurable dictionary. One local NLP provider produces sentiment, event classification, impact and confidence, together with the evidence behind them.

“The signal is stored and exposed through REST APIs. When impact reaches seven, the stress engine automatically maps it to risk-factor shocks and values the portfolio. All demo events and all eighteen portfolio positions are synthetic. Public live reports, when used, remain unverified inputs.”

## 2:10–3:20 Run the geopolitical event

**Show:** Select **Geopolitical conflict** and click **Run Demo Scenario**. Wait for confirmation. Show the selected event and scroll to **Why this signal?**.

**Say:** “I will now run the geopolitical demonstration. This fictional event describes escalating tensions, sanctions and market disruption. The button passes the text through the actual scoring functions; the displayed result is not a hardcoded animation.

“The sentiment is approximately minus zero point nine eight, indicating strongly negative language. The classifier selects Geopolitical, and the impact is nine point five out of ten.

“The six overview cards summarize retained events, high-risk events, average sentiment, highest impact, the original portfolio value and the selected scenario loss. The charts show signal intensity, event categories and source coverage.

“These are summaries of the signals currently stored. They should not be interpreted as a forecast of the entire financial market.”

**Pause:** Give the viewer time to read the scores. Do not read every KPI.

## 3:20–4:00 Explain the signal and JSON

**Show:** Point to matched terms, classification evidence and impact factors. Expand **Structured API output**.

**Say:** “Here is why the signal received its scores. Sentiment uses weighted financial phrases, negation handling and intensifiers. Classification compares weighted evidence across eleven categories.

“Impact combines category severity, sentiment strength, urgency, systemic language, recognized entities, source type and recency. Each contribution is visible.

“Confidence measures the strength of the rule evidence. It is not the probability that a news claim is true. The structured JSON contains the scores, source, timestamps, entities and explanation, allowing another system to consume the same signal through the API.”

## 4:00–5:40 Automatic portfolio stress test

**Show:** Scroll to **Portfolio impact**. Point to **AUTO-TRIGGERED**, shocks, before/after chart and positions. Pause on a bond, a loan and a pay-fixed interest-rate hedge.

**Say:** “Because the impact is above seven, the system has automatically created a geopolitical scenario. Its strength depends on both impact and sentiment magnitude.

“For this example, the scaled demonstration assumptions are roughly a nine point four percent equity decline, a ninety-four-basis-point rate increase, and a one-hundred-and-forty-one-basis-point increase in credit spreads. One hundred basis points means one percentage point.

“The original portfolio is one hundred million US dollars. Under these assumptions, its stressed value is approximately ninety-three point nine two million. The illustrative loss is six point zero eight million, or about six point zero eight percent.

“The position table explains how that result is built. Equities respond through beta and any matched issuer or sector shock. Bonds use duration to approximate the effect of rates and spreads. Loans subtract the increase in expected credit loss, using exposure, probability of default and loss given default.

“Interest-rate derivatives use signed DV01, meaning the dollar change for a one-basis-point rate move. This pay-fixed hedge gains when rates rise. FX positions use signed currency exposure. Gains are retained, and every scenario starts from the same original portfolio.”

## 5:40–6:40 Compare adverse and positive events

**Show:** Run **Credit downgrade** and briefly show its result. Then run **Positive earnings** and show **No stress scenario for this signal**.

**Say:** “Different event types map to different financial transmission channels. The credit-downgrade example produces an impact of nine and an illustrative loss of about four point five million dollars. Its assumptions emphasize credit spreads and default risk.

“Now I will run positive earnings. Sentiment becomes positive, approximately plus zero point nine nine, while impact is five point one. The event remains visible, but it does not automatically trigger a stress test because it is below seven.

“This distinction matters: sentiment describes the direction of the language, while impact measures its potential significance under our scoring rules. The system does not treat every event as an automatic portfolio crisis.”

## 6:40–7:25 Analyze a new text input

**Show:** Click **Analyze text**. Paste the fictional example below, keep **Financial news**, and click the analysis button. Show the returned evidence and scenario.

```text
Ardent Bank's credit rating was downgraded after severe liquidity concerns. A sudden systemic liquidity crisis raises default risk.
```

**Say:** “The engine also accepts new text, beyond the prepared buttons. I am entering a fictional report about Ardent Bank. The same validation, entity extraction, NLP and stress pipeline processes this input.

“It recognizes credit-risk language and returns a Credit Event signal. The evidence panel shows what influenced that decision. If the same text has already been processed, the system reuses its stored result instead of adding a duplicate. This makes the input-to-signal-to-portfolio connection directly inspectable.”

## 7:25–8:15 Tests and engineering choices

**Show:** Run `npm test` in a second VS Code terminal and let all 41 tests finish. Briefly show test filenames and `src/services/`. Keep the server in its own terminal.

**Say:** “The implementation separates ingestion, NLP and valuation from the React interface. Zod validates requests and stored data, while a lightweight JSON store persists signals and scenarios for a single server process.

“Here the test suite passes forty-one tests. It covers scoring, classification, the exact impact threshold, scenario mapping, financial formulas, validation errors, fallback behavior and persistence.

“The production build and actual HTTP route checks have also passed. These tests verify software behavior and arithmetic. They do not establish predictive accuracy or financial calibration.”

## 8:15–9:30 Business value and limitations

**Show:** Return to the geopolitical result; briefly show slide 6, then slide 7.

**Say:** “The business value is a traceable path from an external headline to a structured signal, a scenario and individual portfolio exposures. An analyst can inspect why an alert appeared, which risk factors moved, and which positions contributed most to the result.

“A sentiment-only display stops at positive or negative language. This prototype continues into an explicit portfolio sensitivity. I have not measured an efficiency gain against an existing banking system, so I am not claiming a percentage improvement.

“There are important limitations. The English rule-based NLP can miss sarcasm and complex context. Dictionary-based entity recognition cannot identify every company. Public feeds may contain rumors or become unavailable. Impact scores, confidence and shocks are uncalibrated demonstration assumptions.

“The valuation model simplifies bonds, loans and derivatives, and the local store supports one server process. Next steps would be evaluating finance-specific language models, improving source corroboration and calibrating scenarios against historical market data.”

## 9:30–10:00 Close

**Show:** Repository README, then slide 1 or the dashboard overview.

**Say:** “The public repository includes the code, datasets, architecture, seven-slide presentation, setup instructions and methodology. This is an educational decision-support prototype, not investment advice or a production risk model.

“I used AI assistance for implementation, debugging, testing and documentation, and I am responsible for reviewing and explaining this submission. RiskPulse AI demonstrates how unstructured information can be connected to explainable portfolio risk. Thank you.”

## Before you speak

Practise every calculation and code path you mention. Use your own natural wording once you understand it. If you have not reviewed a module, study it with [JURY_QA.md](JURY_QA.md) before recording. Do not claim independent work or measured accuracy that you cannot support.

Do not upload the five-minute rehearsal as the ten-minute submission. Upload the finished recording to YouTube as **Unlisted**, link it in README, and test it in a signed-out/private window. Keep the MP4 outside Git.
