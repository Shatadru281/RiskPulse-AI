# RiskPulse AI jury preparation

Use these as study notes. Explain the implementation in your own words and open the referenced code while practising.

## What problem do you solve

Headlines alone do not show which portfolio exposures are sensitive to an event. RiskPulse AI links source text to an explainable signal, illustrative shocks and position-level valuation. It implements Module B, not a trading recommendation engine.

## Is this a trained AI model

No. It performs NLP using deterministic financial phrase rules. The provider interface supports future model replacement, but the shipped engine favors offline reproducibility and visible evidence. See `src/services/nlp/`.

## How are the scores different

Sentiment is signed language polarity from −1 to +1. Classification is the strongest weighted topic across eleven categories. Impact is a 1–10 heuristic combining severity, sentiment magnitude and contextual factors. Confidence describes rule evidence, not measured accuracy or the truth of a report.

## Why is the trigger seven

Seven is a demonstration threshold separating monitoring from automatic sensitivity analysis. It is not historically calibrated. Tests cover exactly 7.0 and below-threshold 6.9. Production calibration would require a defined risk objective and validation data.

## Why do positive earnings not trigger stress

The fixture has positive sentiment but impact 5.1, below seven. A positive event with sufficiently high impact could still trigger a favorable sensitivity. Positive sentiment does not automatically imply low significance.

## What controls scenario severity

The category selects base shocks. Strength is impact/10 × (0.35 + 0.65 × absolute sentiment). Sentiment above +0.15 reverses the generic adverse direction. This simplified mapping does not infer every actual rate or currency direction from language.

## How is the portfolio valued

Equities use beta and issuer/sector sensitivities. Bonds use duration against rate and relevant spread changes; government bonds receive no corporate spread shock. Loans use incremental EAD × PD × LGD. Rate derivatives use signed USD-per-basis-point DV01; FX uses signed USD-equivalent exposure. Totals reconcile from individual positions. See `valuation.ts` and `METHODOLOGY.md`.

## Why only incremental expected loan loss

Baseline mark-to-market is treated as already incorporating baseline credit risk. Subtracting all stressed expected loss would count the baseline component twice. The adjustment is stressed expected loss minus baseline expected loss.

## Why can a derivative gain

The sign represents exposure direction. A pay-fixed hedge has positive DV01 under this project's convention and gains when rates rise; receive-fixed exposure loses. Negative scenario loss is a gain. Derivatives can become negative mark-to-market liabilities.

## Are scenario losses added together

No. Every scenario starts from the same original $100M portfolio. Geopolitical and credit results are alternative sensitivities, not cumulative expected losses. Do not add them and call the sum VaR or expected shortfall.

## What happens if a feed fails

Each adapter has a timeout and independent fictional fallback, with source status visible in the UI. Offline mode deliberately uses local fixtures. Tests simulate failure. A feed outage is an availability issue, not evidence that a report is false.

## How do persistence and deduplication work

Normalized inputs, signals and stress results use a local JSON store. A hash of normalized title/body prevents exact duplicate content from adding repeated signals. This is not semantic clustering or independent corroboration. Operations serialize within one Node process; retention is capped at 500 events.

## Does real time mean streaming

No. The browser refreshes state every 30 seconds; live collection occurs at most every five minutes while requested. This is demand-driven polling, with no broker or latency guarantee.

## What do the tests prove

The 41 tests check behavior, arithmetic, schema validation, fallback and persistence. The production build and HTTP checks also pass. These are not evidence of out-of-sample predictive accuracy or calibrated financial probabilities.

## Why fictional data

The guidelines allow synthetic or public data and prohibit confidential client information. All demo reports and portfolio positions are invented. Real names in the entity dictionary are lookup examples, with no synthetic allegations attached.

## How did you use AI

AI assistance supported implementation, debugging, tests and documentation. Do not claim every line was written unaided. Review the services, run the tests and be ready to explain design choices, signs, formulas and limitations yourself.

## What would you improve first

Evaluate finance-specific NLP on labeled examples, improve entity resolution and corroboration, calibrate scenarios using historical data, and use transactional storage before multi-user deployment. Do not promise measured benefits before evaluating those changes.
