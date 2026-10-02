import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { POST as analyze } from "@/app/api/analyze/route";
import { POST as stress } from "@/app/api/stress-test/route";
import { POST as ingest } from "@/app/api/ingest/route";
import { GET as health } from "@/app/api/health/route";
import { getDashboard } from "@/services/pipeline";
import { AnalyzeSchema, NormalizedTextItemSchema } from "@/types";
let directory: string;
const previous = process.env.RISK_STORE_PATH;
beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "riskpulse-test-"));
  process.env.RISK_STORE_PATH = path.join(directory, "state.json");
});
afterAll(async () => {
  if (previous === undefined) delete process.env.RISK_STORE_PATH;
  else process.env.RISK_STORE_PATH = previous;
  await rm(directory, { recursive: true, force: true });
});
const request = (body: unknown) =>
  new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
describe("API contracts and persistence", () => {
  it("rejects malformed, short, oversized, extra-field and unsupported inputs", async () => {
    expect((await analyze(request({ text: "short" }))).status).toBe(400);
    expect((await analyze(request({ text: "a".repeat(12001) }))).status).toBe(
      400,
    );
    expect(
      (
        await analyze(
          request({ text: "Ardent faces bankruptcy", apiKey: "do not accept" }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await analyze(
          new Request("http://localhost/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await analyze(
          new Request("http://localhost/api/analyze", {
            method: "POST",
            body: "hello",
          }),
        )
      ).status,
    ).toBe(415);
    expect((await analyze(request({ text: "x".repeat(70000) }))).status).toBe(
      413,
    );
    expect(AnalyzeSchema.safeParse({ text: "          " }).success).toBe(false);
    expect(
      NormalizedTextItemSchema.safeParse({
        id: "x",
        source: "x",
        sourceType: "news",
        text: "test text",
        publishedAt: "bad",
      }).success,
    ).toBe(false);
  });
  it("reports health and seeds both source types", async () => {
    expect((await health()).status).toBe(200);
    const data = await getDashboard();
    expect(data.events).toHaveLength(15);
    expect(data.stressTests.length).toBeGreaterThan(0);
  });
  it("analyzes, auto-triggers and deduplicates concurrent submissions", async () => {
    const body = {
      text: "Ardent Bank faces a sudden systemic liquidity crisis, bankruptcy and default in a fictional test.",
    };
    const responses = await Promise.all([
      analyze(request(body)),
      analyze(request(body)),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 201]);
    const results = await Promise.all(responses.map((r) => r.json()));
    expect(results[0].id).toBe(results[1].id);
    expect(results[0].stressTest.loss).toBeGreaterThan(0);
    const state = await getDashboard();
    expect(
      state.events.filter((e) => e.signal.id === results[0].id),
    ).toHaveLength(1);
    const saved = JSON.parse(
      await readFile(process.env.RISK_STORE_PATH!, "utf8"),
    );
    expect(saved.events.length).toBe(state.events.length);
  });
  it("keeps low-impact input without automatic stress and supports manual sensitivity", async () => {
    const response = await analyze(
      request({
        text: "Helix Healthcare confirms tomorrow's routine meeting date for this API test.",
      }),
    );
    const signal = await response.json();
    expect(signal.stressTest).toBeNull();
    const manual = await stress(request({ eventId: signal.id }));
    expect(manual.status).toBe(200);
    expect((await manual.json()).automatic).toBe(false);
    expect((await stress(request({ eventId: "does-not-exist" }))).status).toBe(
      404,
    );
  });
  it("supports replay and rejects inconsistent ingestion requests", async () => {
    const response = await ingest(
      request({ mode: "demo", scenario: "geopolitical" }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).added).toBe(0);
    expect(
      (await ingest(request({ mode: "live", scenario: "credit" }))).status,
    ).toBe(400);
  });
  it("reports newly added signals correctly at the retention limit", async () => {
    const state = await getDashboard();
    const template = state.events[0];
    state.events = Array.from({ length: 500 }, (_, i) => ({
      ...template,
      fingerprint: `fixture-${i}`,
      item: { ...template.item, id: `item-${i}` },
      signal: {
        ...template.signal,
        id: `sig-fixture-${i}`,
        sourceId: `item-${i}`,
      },
    }));
    await writeFile(
      process.env.RISK_STORE_PATH!,
      JSON.stringify(state),
      "utf8",
    );
    const response = await analyze(
      request({
        text: "Helix Healthcare confirms a routine meeting at the retention boundary.",
      }),
    );
    expect(response.status).toBe(201);
    expect((await response.json()).deduplicated).toBe(false);
    const retained = await getDashboard();
    expect(retained.events).toHaveLength(500);
    expect(retained.stressTests).toHaveLength(0);
  });
  it("recovers a corrupt store while retaining a warning", async () => {
    await writeFile(process.env.RISK_STORE_PATH!, "corrupted", "utf8");
    const state = await getDashboard();
    expect(state.events).toHaveLength(15);
    expect(state.warning).toContain("preserved");
  });
});
