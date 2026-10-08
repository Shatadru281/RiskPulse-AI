import pptxgen from "pptxgenjs";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { localDemoAdapter } from "../src/services/ingestion/localDemoAdapter";
import { riskEngine } from "../src/services/nlp/riskEngine";
import {
  runStressTest,
  shouldAutoStress,
} from "../src/services/stress/stressEngine";
const C = {
  navy: "102C36",
  teal: "087F70",
  muted: "708780",
  cream: "F5F8F5",
  red: "B54942",
  border: "D6E2DA",
};
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "RiskPulse AI contributor";
pptx.subject = "S&P Global & CRISIL Campus Hackathon 2026";
pptx.title = "RiskPulse AI";
pptx.company = "Educational hackathon prototype";
pptx.theme = { headFontFace: "Aptos", bodyFontFace: "Aptos" };
const now = new Date("2026-10-02T12:00:00.000Z");
const examples = ["geopolitical", "credit", "rates", "cyber", "earnings"].map(
  (id) => {
    const signal = riskEngine.analyze(
      localDemoAdapter("news", now, id)[0],
      now,
    );
    const result = shouldAutoStress(signal)
      ? runStressTest(signal, undefined, true, now)
      : null;
    return { id, signal, result };
  },
);
const geo = examples[0];
const result = geo.result!;
const usd = (n: number) => `$${(n / 1e6).toFixed(2)}M`;
function slide(title: string, num: number) {
  const s = pptx.addSlide();
  s.background = { color: C.cream };
  s.addText(title, {
    x: 0.6,
    y: 0.45,
    w: 12.1,
    h: 0.65,
    fontFace: "Aptos",
    fontSize: 30,
    bold: true,
    color: C.navy,
    margin: 0,
    breakLine: false,
  });
  s.addText(`RiskPulse AI   /   Campus Hackathon 2026`, {
    x: 0.6,
    y: 7.08,
    w: 10,
    h: 0.2,
    fontSize: 9,
    color: C.muted,
    margin: 0,
  });
  s.addText(String(num).padStart(2, "0"), {
    x: 12.1,
    y: 7.08,
    w: 0.5,
    h: 0.2,
    fontSize: 9,
    color: C.muted,
    margin: 0,
    align: "right",
  });
  return s;
}
function text(
  s: pptxgen.Slide,
  value: string,
  x: number,
  y: number,
  w: number,
  h: number,
  size = 20,
  color: string = C.navy,
  bold = false,
) {
  s.addText(value, {
    x,
    y,
    w,
    h,
    fontSize: size,
    fontFace: "Aptos",
    color,
    bold,
    margin: 0,
    breakLine: false,
    paraSpaceAfter: 8,
    valign: "middle",
  });
}
function notes(s: pptxgen.Slide, value: string) {
  s.addNotes(value);
}
async function main() {
  const cover = pptx.addSlide();
  cover.background = { color: C.navy };
  text(cover, "RiskPulse AI", 0.75, 1.05, 11.8, 1.2, 54, "FFFFFF", true);
  text(
    cover,
    "Real-Time AI Financial Risk Intelligence &\nEvent-Driven Portfolio Stress Testing Platform",
    0.8,
    2.55,
    11.6,
    1.2,
    26,
    "ABD8CA",
  );
  text(
    cover,
    "S&P Global & CRISIL Campus Hackathon 2026",
    0.8,
    4.45,
    11.5,
    0.5,
    19,
    "FFFFFF",
  );
  text(
    cover,
    "Candidate: Shatadru Adhikary\nCollege / campus: Vellore Institute of Technology\nCollege email: shatadru.23bce8160@vitapstudent.ac.in",
    0.8,
    5.28,
    11.6,
    1.1,
    17,
    "A1B9BB",
  );
  notes(
    cover,
    "Educational hackathon prototype. All demo reports and portfolio positions are synthetic. Individual submission by Shatadru Adhikary. Branding does not imply sponsor endorsement.",
  );

  const s2 = slide("Problem & approach", 2);
  text(
    s2,
    "External information moves faster than a static portfolio view.",
    0.65,
    1.45,
    11.8,
    0.9,
    32,
    C.navy,
    true,
  );
  text(
    s2,
    "Risk teams need to see which event matters, why it matters, and how an illustrative scenario affects their exposures.",
    0.65,
    2.63,
    11.8,
    0.9,
    23,
    C.muted,
  );
  const labels = [
    "News + social",
    "Unified NLP",
    "Risk signals",
    "Stress testing",
  ];
  labels.forEach((label, i) => {
    const x = 0.65 + i * 3.15;
    text(
      s2,
      String(i + 1).padStart(2, "0"),
      x,
      4.2,
      2.55,
      0.45,
      18,
      C.teal,
      true,
    );
    text(s2, label, x, 4.82, 2.5, 0.55, 23, C.navy, true);
    if (i < 3)
      s2.addShape(pptx.ShapeType.line, {
        x: x + 2.65,
        y: 5.1,
        w: 0.32,
        h: 0,
        line: {
          color: C.teal,
          width: 1.5,
          beginArrowType: undefined,
          endArrowType: "triangle",
        },
      });
  });
  text(
    s2,
    "Decision support starts with traceable evidence and a visible link to portfolio impact.",
    0.65,
    6.12,
    11.8,
    0.55,
    18,
    C.muted,
  );
  notes(
    s2,
    "The value chain is information, intelligence, risk signal, scenario, portfolio impact and decision support. The application implements Module B strategic portfolio stress testing.",
  );

  const s3 = slide("System architecture", 3);
  s3.addImage({
    path: "docs/architecture.png",
    x: 1.73,
    y: 1.24,
    w: 9.87,
    h: 5.55,
  });
  notes(
    s3,
    "Sources are BBC business RSS and Reddit finance Atom in live mode, plus independent local fallbacks. Source adapters normalize content. Cleaning, deduplication and dictionary entities feed a deterministic provider. Local JSON persists normalized inputs, signals and scenario results. The browser polls state every 30 seconds; live feeds refresh at most once per five minutes while requested. See docs/METHODOLOGY.md and source code.",
  );

  const s4 = slide("Unified AI/NLP Risk Engine", 4);
  const features = [
    [
      "Sentiment",
      "Weighted financial phrases with negation and intensifiers. Range −1 to +1.",
    ],
    [
      "Classification",
      "Eleven event classes compete on weighted evidence. Confidence is heuristic.",
    ],
    [
      "Impact",
      "Severity, sentiment, urgency, systemic context, entities, source and recency.",
    ],
    [
      "Entities & evidence",
      "Configurable names and tickers. Matched terms and every impact factor remain visible.",
    ],
  ];
  features.forEach(([label, body], i) => {
    text(s4, label, 0.65, 1.55 + i * 1.17, 2.35, 0.45, 21, C.teal, true);
    text(s4, body, 3.2, 1.55 + i * 1.17, 9.2, 0.73, 20, C.navy);
  });
  text(
    s4,
    `Geopolitical demo: sentiment ${geo.signal.sentimentScore}  /  impact ${geo.signal.impactScore}/10`,
    0.65,
    6.38,
    12,
    0.4,
    18,
    C.muted,
  );
  notes(
    s4,
    "Values come from the actual TypeScript risk engine at a fixed demonstration clock. No random scores, pretrained model or paid API is required. Confidence is rule evidence, not measured accuracy. Transformers.js was investigated but model downloads and finance-specific validation were avoided for reliable offline judging. https://huggingface.co/docs/transformers.js/en/pipelines",
  );

  const s5 = slide("Event-driven portfolio stress testing", 5);
  text(
    s5,
    "High-impact event → scenario → shocks → valuation → portfolio impact",
    0.65,
    1.35,
    12,
    0.55,
    21,
    C.muted,
  );
  text(
    s5,
    `Geopolitical event   ${geo.signal.impactScore}/10`,
    0.65,
    2.15,
    6.1,
    0.6,
    27,
    C.navy,
    true,
  );
  text(
    s5,
    `Equity ${(result.scenario.equityShock * 100).toFixed(2)}%\nRates +${(result.scenario.interestRateShock * 10000).toFixed(0)} bp\nCredit spreads +${(result.scenario.creditSpreadShock * 10000).toFixed(0)} bp\nFX ${(result.scenario.fxShock * 100).toFixed(2)}%`,
    0.65,
    3.05,
    5.2,
    2.05,
    22,
    C.navy,
  );
  s5.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Portfolio value (USD millions)",
        labels: ["Before", "After"],
        values: [result.beforeValue / 1e6, result.afterValue / 1e6],
      },
    ],
    {
      x: 6.8,
      y: 2.2,
      w: 5.6,
      h: 3.65,
      catAxisLabelFontFace: "Aptos",
      fontFace: "Aptos",
      dataLabelFontFace: "Aptos",
      legendFontFace: "Aptos",
      titleFontFace: "Aptos",
      valAxisLabelFontFace: "Aptos",
      catAxisLabelFontSize: 16,
      valAxisLabelFontSize: 12,
      showLegend: false,
      showTitle: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0.00"M"',
      dataLabelColor: C.navy,
      chartColors: [C.navy, C.teal],
      valAxisMinVal: 0,
      valAxisMaxVal: 115,
      valAxisMajorUnit: 25,
      catAxisLineShow: false,
      valAxisLineShow: false,
    },
  );
  text(
    s5,
    `${usd(result.loss)} illustrative loss  /  ${result.lossPct.toFixed(2)}% drawdown`,
    0.65,
    5.75,
    12,
    0.65,
    29,
    C.red,
    true,
  );
  text(
    s5,
    "DEMONSTRATION ASSUMPTIONS. Independent scenario on a $100M synthetic portfolio.",
    0.65,
    6.53,
    12,
    0.35,
    14,
    C.muted,
  );
  notes(
    s5,
    "The generator computes these outputs by calling the same services as the API. Rates and spreads are decimals internally; 0.01 equals 100 basis points. Duration values bonds, incremental EAD × PD × LGD values loans, signed DV01 values swaps, and signed exposure values FX. Derivative hedges can gain. This scenario is not a forecast.",
  );

  const s6 = slide("Results & domain impact", 6);
  if (existsSync("docs/dashboard.png")) {
    const dimensions = await sharp("docs/dashboard.png").metadata();
    const ratio = dimensions.width! / dimensions.height!;
    const imageWidth = Math.min(8.3, 4.95 * ratio);
    const imageHeight = imageWidth / ratio;
    s6.addImage({
      path: "docs/dashboard.png",
      x: 0.65,
      y: 1.5 + (4.95 - imageHeight) / 2,
      w: imageWidth,
      h: imageHeight,
    });
  } else
    text(
      s6,
      "Dashboard preview\nOpen localhost:3000 to view the interactive workspace.",
      0.65,
      2,
      8.3,
      2,
      24,
      C.muted,
    );
  text(s6, "5", 9.45, 1.75, 2.9, 0.8, 46, C.teal, true);
  text(s6, "reproducible demo scenarios", 9.45, 2.58, 2.9, 0.9, 18, C.navy);
  text(s6, "18", 9.45, 3.76, 2.9, 0.8, 46, C.teal, true);
  text(
    s6,
    "synthetic positions across six asset classes",
    9.45,
    4.59,
    2.9,
    1,
    18,
    C.navy,
  );
  text(
    s6,
    "One evidence trail links a financial headline to a scenario and asset-level losses.",
    0.65,
    6.48,
    12,
    0.4,
    17,
    C.muted,
  );
  notes(
    s6,
    "The screenshot is a locally rendered application view, when available. Key outputs include machine-readable signals, factors explaining impact, automatic threshold triggers, individual scenario exports and position-level loss attribution. These are prototype capabilities, not evidence of predictive accuracy.",
  );

  const s7 = slide("Limitations & future work", 7);
  text(s7, "Current boundaries", 0.65, 1.65, 5.65, 0.55, 26, C.navy, true);
  text(s7, "Next improvements", 7, 1.65, 5.65, 0.55, 26, C.teal, true);
  [
    "Rule-based English NLP can miss context.",
    "Public feeds can fail or contain rumors.",
    "Shocks are illustrative and uncalibrated.",
    "Local persistence supports one server process.",
  ].forEach((body, i) =>
    text(s7, body, 0.65, 2.55 + i * 0.93, 5.45, 0.72, 20, C.muted),
  );
  [
    "Validate finance-specific transformer models.",
    "Add source corroboration and entity resolution.",
    "Calibrate scenarios to historical market data.",
    "Extend to VaR, expected shortfall and contagion.",
  ].forEach((body, i) =>
    text(s7, body, 7, 2.55 + i * 0.93, 5.45, 0.72, 20, C.navy),
  );
  text(
    s7,
    "Educational prototype. No guaranteed predictions or investment advice.",
    0.65,
    6.46,
    12,
    0.4,
    17,
    C.red,
  );
  notes(
    s7,
    "Limitations include fixed parallel shocks, no convexity, no yield-curve modeling, no stressed liquidity, no calibrated dependence or production authentication. Real company dictionary entries are lookup examples only. All sample events are fictional.",
  );
  await mkdir("docs", { recursive: true });
  await writeFile(
    "docs/demo-results.json",
    JSON.stringify(
      examples.map(({ id, signal, result }) => ({
        scenario: id,
        sentiment: signal.sentimentScore,
        category: signal.eventClassification,
        impact: signal.impactScore,
        confidence: signal.confidence,
        before: result?.beforeValue ?? null,
        after: result?.afterValue ?? null,
        loss: result?.loss ?? null,
        lossPct: result?.lossPct ?? null,
      })),
      null,
      2,
    ) + "\n",
  );
  await pptx.writeFile({ fileName: "docs/presentation.pptx" });
  // PptxGenJS 4.0.1 can declare unused slide masters in the content-type manifest.
  // Remove only declarations with no corresponding part; slide content is unchanged.
  const archive = await JSZip.loadAsync(
    await readFile("docs/presentation.pptx"),
  );
  const contentTypes = await archive
    .file("[Content_Types].xml")!
    .async("string");
  archive.file(
    "[Content_Types].xml",
    contentTypes.replace(
      /<Override\b[^>]*PartName="([^"]+)"[^>]*\/>/g,
      (entry, part: string) =>
        archive.file(part.replace(/^\//, "")) ? entry : "",
    ),
  );
  await writeFile(
    "docs/presentation.pptx",
    await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
  );
  console.log(
    "Generated seven-slide docs/presentation.pptx and computed demo-results.json.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
