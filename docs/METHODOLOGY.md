# RiskPulse AI methodology

Real-Time AI Financial Risk Intelligence & Event-Driven Portfolio Stress Testing Platform

**SYNTHETIC DATA — DEMONSTRATION ONLY.** This is a simplified hackathon stress-testing framework. Scores are heuristic, shocks are illustrative and scenario losses are not forecasts, actual expected losses or investment advice. All figures use USD equivalent.

## 1. Inputs, provenance and time

Financial news RSS and public discussion Atom normalize to `NormalizedTextItem`. It carries an ID, source, news/social type, title, text, publication timestamp, optional URL/author and `isDemo`. Public reports remain unverified. The parser accepts dated entries only and rejects future entries more than five minutes ahead, DTD/entity declarations, non-HTTPS configured feed URLs and payloads over 2 MB. Live sources have five-second timeouts and independent fallback.

HTML is removed. A SHA-256 hash of normalized title plus body deduplicates case and punctuation variations across sources. Repeated articles do not rerun NLP or add stress results. Exact duplicate merging retains the first source; this is not corroboration. Distinct paraphrases remain separate. Demo replay deliberately recomputes the selected fixture, refreshes its synthetic timestamp, and replaces its prior result. Arbitrary user input is labeled unverified and never assumed to be a real event.

Live polling is demand-driven: browser state refresh every 30 seconds, source collection after five minutes since the last check. Closing the browser stops polling. No background cron, streaming broker or latency SLA is claimed.

## 2. Sentiment

The custom English financial lexicon lives in `src/services/nlp/sentiment.ts`. Longer phrases match first and consume their tokens, avoiding overlap with component words. Repeated phrases in distinct places count again. Title and body are combined unless the body starts with the title. A routine text with no matches returns exactly 0.

For each match with base weight `w`:

```text
weightedTerm = w × negation × intensifier × dampener
negation = -0.65 if a negator is in the prior three tokens, otherwise 1
intensifier = maximum recognized multiplier in that window, otherwise 1
dampener = 0.6 for "slightly" or "modest", otherwise 1
sentiment = round(tanh(sum(weightedTerm) / (3.5 + 0.45 × matchCount)), 3)
```

Negation scope stops at sentence punctuation, commas, semicolons, “but” or “however”. Examples include not, no, never, without, denies and avoided. Intensifiers include severe (1.5), sharply (1.4) and significantly (1.3). The result lies in [-1,+1]. This is reproducible for identical input. Tanh may saturate for strongly repeated language. Complex linguistic scopes and non-English text are not reliably modeled.

## 3. Classification and confidence

All eleven categories compete using word-boundary phrase matches. Examples: bankruptcy weight 6 in Credit Event, central bank weight 5 in Macroeconomic, cyberattack weight 6 in Cybersecurity. Each dictionary phrase counts once in its category. Related and overlapping phrases can contribute separately to classification. Category insertion order breaks an exact tie deterministically.

Let `b` be the strongest category score and `r` the runner-up:

```text
classificationConfidence = min(0.96, 0.35 + 0.35 × b/(b+4) + 0.26 × (b-r)/b)
no matches: category = Other, classificationConfidence = 0.25
sentimentEvidence = min(0.95, 0.3 + 0.12 × sentimentMatchCount)
signalConfidence = min(0.95, 0.7 × classificationConfidence + 0.3 × sentimentEvidence)
```

Confidence is rounded to three decimals. It is an evidence heuristic, **not measured model accuracy or the probability that the news is true**.

## 4. Entity extraction

`data/company-map.json` maps full names, aliases and tickers to a sector. Matching uses word boundaries. The engine also recognizes listed countries and major institutions. The first company by dictionary order fills `company`/`ticker`; all recognized entities appear in `entities`. This is not a learned named-entity model, and ambiguous abbreviations can produce false matches.

## 5. Explainable impact score

```text
impact = round(clamp(base + 1.8 × abs(sentiment) + urgency + systemic
                    + breadth + source + 0.5 × confidence + recency, 1, 10), 1)
urgency = min(1, 0.5 × distinct urgency keywords)
systemic = min(1, 0.5 × distinct systemic keywords)
breadth = min(0.4, 0.1 × recognized entity count)
source = +0.2 for news, -0.1 for public discussion
recency = -min(1, max(0, ageHours) / 168)
```

Urgency words: unexpectedly, urgent, immediately, sudden, escalating, shutdown, ransomware, bankruptcy. Systemic phrases: global, systemic, contagion, banking system, central bank, liquidity crisis. The small source adjustment is an explicit demonstration assumption about information quality, not a fact-checking mechanism. Factors are individually rounded to three decimals before aggregation.

| Category           | Base |
| ------------------ | ---: |
| Credit Event       |  5.5 |
| Geopolitical       |  5.4 |
| Cybersecurity      |  5.0 |
| Macroeconomic      |  4.8 |
| Supply Chain       |  4.3 |
| Regulatory         |  4.0 |
| Market Event       |  3.8 |
| Merger/Acquisition |  3.0 |
| Earnings           |  2.6 |
| Product Launch     |  1.8 |
| Other              |  1.0 |

Every contribution is stored in `evidence.impactFactors`. Scores are snapshots at analysis time; they do not silently decay in storage. There is no optional corroboration bonus in this version. Words like “no bankruptcy” can still indicate the Credit Event topic; sentiment scope may reverse the direction while severity remains high. That limitation is visible in the evidence.

## 6. Scenario mapping

Impact **≥7** automatically generates a scenario. Lower scores remain visible and offer a manual sensitivity. Category selects base shocks; impact and sentiment set size and direction:

```text
strength = round((impact/10) × (0.35 + 0.65 × abs(sentiment)), 4)
directionSign = -1 when sentiment > +0.15 (favorable), otherwise +1 (adverse)
appliedShock = baseShock × strength × directionSign
PD multiplier = 1 + (basePDMultiplier - 1) × strength × directionSign
```

**DEMONSTRATION ASSUMPTIONS, all uncalibrated:**

| Category           | Equity | Rates bp | Credit bp |    FX | Issuer equity | Sector equity | PD mult. |
| ------------------ | -----: | -------: | --------: | ----: | ------------: | ------------: | -------: |
| Geopolitical       |   -10% |     +100 |      +150 |   -5% |            0% |            0% |     1.60 |
| Macroeconomic      |    -8% |     +200 |      +100 |   -3% |            0% |            0% |     1.40 |
| Credit Event       |    -4% |      +25 |      +250 |   -1% |          -20% |            0% |     1.50 |
| Cybersecurity      |    -1% |        0 |       +40 |   -1% |          -12% |           -4% |     1.30 |
| Supply Chain       |    -3% |      +25 |       +50 |   -1% |          -10% |           -5% |     1.35 |
| Regulatory         |    -3% |      +25 |       +50 |   -1% |           -8% |           -3% |     1.25 |
| Merger/Acquisition |    -1% |      +25 |       +50 |   -1% |           -6% |            0% |     1.10 |
| Product Launch     |     0% |        0 |         0 |    0% |           -4% |            0% |     1.05 |
| Earnings           |    -2% |        0 |       +50 |   -1% |           -8% |            0% |     1.20 |
| Market Event       |   -12% |      +25 |      +100 | -2.5% |            0% |            0% |     1.30 |
| Other              |    -3% |      +25 |       +50 |   -1% |            0% |            0% |     1.15 |

Percentages become decimal fractions internally; 0.01 rate change = 100 bp. Negative FX means foreign currency depreciates relative to USD. Issuer and sector targeting use recognized company names and dictionary sectors. Broad market shocks still apply when an issuer cannot be matched. This generic mapping does not infer the actual direction of rates from language such as rate cuts; favorable/adverse sensitivities are explicitly simplified.

## 7. Position valuation

The portfolio totals **$100M**: corporate loans $37M, corporate bonds $27M, government bonds $12M, equities $16M, interest rate derivatives $4M, FX derivatives $4M. Notional is distinct from mark-to-market. Loan notional serves as EAD. No historical prices are implied.

### Equities

```text
targetShock = issuerShock if counterparty matched
              else sectorShock if sector matched
              else 0
stressedValue = max(0, marketValue × (1 + equityShock × beta + targetShock))
```

Issuer shock takes precedence over sector shock to avoid double counting. Market beta applies separately to all equities.

### Bonds

```text
deltaValue = -marketValue × duration × (interestRateShock + spreadShock)
spreadShock = corporateCreditShock for corporate bonds, 0 for government bonds
stressedValue = max(0, marketValue + deltaValue)
```

Duration is in years and approximates modified duration. Every corporate bond receives the same corporate spread shock, including in issuer-oriented scenarios. No convexity, rating transitions, curve structure or additional default loss is added to bonds.

### Corporate loans

```text
exposureScale = 1 for macro/geopolitical/market/other events or matched issuer
                0.5 for same-sector, unmatched issuer on a local event
                0.2 otherwise on a local event
stressedPD = clamp(PD × (1 + (PDmultiplier-1) × exposureScale), 0, 1)
baseEL = EAD × PD × LGD
stressedEL = EAD × stressedPD × LGD
stressedValue = max(0, marketValue - (stressedEL - baseEL))
```

Local categories are Credit Event, Cybersecurity, Regulatory, Supply Chain, Earnings, Product Launch and Merger/Acquisition. **Only the increase in expected credit loss is subtracted**, because the supplied base mark-to-market is treated as already incorporating base credit risk. This is an illustrative incremental adjustment, not a full loan-pricing or accounting provision model. PD/LGD are decimal fractions and PD is capped at 100%.

### Interest rate derivatives

```text
deltaValue = signedDV01 × (interestRateShock × 10,000)
stressedValue = marketValue + deltaValue
```

DV01 is USD change in position value for a **+1 bp** parallel rate move. Receive-fixed is negative; pay-fixed is positive in the fixture. Both gains and negative mark-to-market liabilities are permitted. Do not apply an extra minus sign or multiply DV01 by notional again.

### FX derivatives

```text
deltaValue = signedUsdEquivalentFxExposure × fxShock
stressedValue = marketValue + deltaValue
```

Positive exposure is long foreign currency, negative exposure is short. The FX exposure is a signed USD-equivalent sensitivity, not a currency conversion rate. The fixture's EUR and GBP positions share one illustrative foreign-currency shock. Derivative values can cross zero.

### Reconciliation

Position values and monetary losses round to cents. `loss = originalValue - stressedValue`; a negative loss is a gain. Portfolio before/after values sum position values and total loss equals their difference. `lossPct = loss / abs(originalValue) × 100` (zero for zero baseline). Each independent scenario resets to the original portfolio. Never add scenario losses to claim aggregate expected loss, VaR or ES.

## 8. Reliability and reproducibility

Zod validates normalized inputs, signals, positions, results and the stored state. A process-global promise queue serializes file transactions across route bundles. The store writes a temporary sibling file and atomically renames it. This avoids partial JSON during normal single-process operation; it does not provide distributed locking, fsync durability guarantees or multi-server transactions. Up to 500 events and their linked results remain in the local store.

NLP has no random component and no initialization download. An `AIProvider` interface isolates the local implementation for future model evaluation; external enrichment is deliberately not implemented. Vitest verifies formula arithmetic, scope rules, exact threshold boundaries, error paths, fallback behavior, persistence and concurrent deduplication. Fixtures test software behavior, not generalization accuracy.

The model choice follows the public [Transformers.js pipeline API](https://huggingface.co/docs/transformers.js/en/pipelines) and its [Node.js tutorial](https://github.com/huggingface/transformers.js/blob/main/packages/transformers/docs/source/tutorials/node.md). ONNX-backed local inference is feasible, but an initial model download and financial-domain quality evaluation would add operational work. The default local hybrid method satisfies the key-free offline requirement.
