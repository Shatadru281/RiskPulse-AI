import assert from "node:assert/strict";
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
async function get(path: string) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200, path);
  return r.json();
}
async function post(path: string, body: unknown) {
  return fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function main() {
  assert.equal((await get("/api/health")).status, "ok");
  assert.equal((await get("/api/portfolio")).totalValue, 100e6);
  assert.ok((await get("/api/events")).events.length >= 15);
  assert.ok((await get("/api/risk-signals")).signals.length >= 15);
  for (const scenario of [
    "geopolitical",
    "credit",
    "rates",
    "cyber",
    "earnings",
  ]) {
    const r = await post("/api/ingest", { mode: "demo", scenario });
    assert.ok(r.ok);
    const value = await r.json();
    const signal = value.processed[0].signal;
    assert.equal(value.stressTests.length, scenario === "earnings" ? 0 : 1);
    console.log(
      `${scenario}: sentiment=${signal.sentimentScore}, impact=${signal.impactScore}, scenario loss=${value.stressTests[0]?.loss ?? "not triggered"}`,
    );
  }
  const analyzed = await post("/api/analyze", {
    text: "Ardent Bank's credit rating was downgraded after severe liquidity concerns. A sudden systemic liquidity crisis raises default risk.",
  });
  assert.ok(analyzed.ok);
  const signal = await analyzed.json();
  assert.equal(signal.eventClassification, "Credit Event");
  assert.ok(signal.impactScore >= 7);
  assert.ok(signal.stressTest.afterValue < signal.stressTest.beforeValue);
  assert.equal((await post("/api/analyze", { text: "x" })).status, 400);
  assert.equal(
    (await post("/api/stress-test", { eventId: "missing" })).status,
    404,
  );
  assert.ok((await get("/api/dashboard")).stressTests.length > 0);
  assert.equal((await fetch(base)).status, 200);
  console.log(
    "PASS: HTTP routes, validation, demos, automatic triggers and portfolio reconciliation.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
