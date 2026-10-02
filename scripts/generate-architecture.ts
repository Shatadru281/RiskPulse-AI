import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function box(
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  lines: string[],
  dark = false,
) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${dark ? "#102c36" : "#ffffff"}" stroke="${dark ? "#102c36" : "#d5e1db"}" stroke-width="2"/><text x="${x + 26}" y="${y + 42}" fill="${dark ? "#ffffff" : "#173940"}" font-size="25" font-weight="600">${esc(title)}</text>${lines.map((line, i) => `<text x="${x + 26}" y="${y + 83 + i * 32}" fill="${dark ? "#a3cec4" : "#6b817f"}" font-size="19">${esc(line)}</text>`).join("")}`;
}
const line = (d: string, label?: string, x?: number, y?: number) =>
  `<path d="${d}" fill="none" stroke="#598c81" stroke-width="3" marker-end="url(#arrow)"/>${label ? `<text x="${x}" y="${y}" font-size="17" fill="#67847c">${esc(label)}</text>` : ""}`;
async function main() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="#598c81"/></marker></defs><rect width="1920" height="1080" fill="#f5f8f5"/><g font-family="Arial, sans-serif"><text x="75" y="82" fill="#102c36" font-size="42" font-weight="700">RiskPulse AI</text><text x="75" y="122" fill="#6e8580" font-size="21">Real-Time AI Financial Risk Intelligence &amp; Event-Driven Portfolio Stress Testing Platform</text>
  ${box(75, 190, 325, 130, "Financial news", ["Public RSS / Atom"])}
  ${box(75, 340, 325, 130, "Social feed", ["Public discussion RSS"])}
  ${box(75, 490, 325, 130, "Offline demo", ["Fictional news + social"])}
  ${line("M400 255 H448 V405 H500")}${line("M400 405 H500")}${line("M400 555 H448 V405")}
  ${box(500, 300, 325, 210, "Ingestion", ["Common input schema", "Per-source fallback", "5-minute live polling"])}
  ${line("M825 405 H900")}
  ${box(900, 300, 350, 210, "Preprocessing", ["Clean text", "Deduplicate by hash", "Resolve dictionary entities"])}
  ${line("M1250 405 H1330")}
  ${box(1330, 230, 500, 350, "Unified AI/NLP Risk Engine", ["Weighted financial sentiment", "Multi-category evidence scoring", "Explainable impact + confidence", "Local provider, no model download"], true)}
  ${line("M1580 580 V660")}
  ${box(1330, 660, 500, 150, "Structured risk signal", ["JSON / REST API + local storage", "Sentiment, category, impact, evidence"])}
  ${line("M1330 735 H1250", "Impact ≥ 7", 1190, 640)}
  ${box(900, 660, 350, 150, "Stress test engine", ["Event-to-scenario mapping", "Scaled illustrative shocks"])}
  ${line("M900 735 H825")}
  ${box(500, 660, 325, 150, "Portfolio analytics", ["18 synthetic positions", "Before / after / loss"])}
  ${line("M662 810 V886 H745 V920")}
  ${box(500, 920, 800, 115, "Risk dashboard", ["Source status · charts · signal evidence · scenario results"], true)}
  ${line("M1580 810 V978 H1300", "All signals", 1440, 900)}
  <text x="75" y="1018" fill="#779185" font-size="18">DEMONSTRATION ASSUMPTIONS</text><text x="75" y="1047" fill="#779185" font-size="16">Educational prototype. Synthetic portfolio.</text>
  </g></svg>`;
  await mkdir("docs", { recursive: true });
  await writeFile("docs/architecture.svg", svg);
  await sharp(Buffer.from(svg)).png().toFile("docs/architecture.png");
  console.log(
    "Generated docs/architecture.png (1920 × 1080) and editable SVG.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
