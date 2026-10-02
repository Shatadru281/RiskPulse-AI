import { readState, saveState, withStore } from "@/lib/store";
import { cleanText, fingerprint } from "@/lib/text";
import {
  NormalizedTextItemSchema,
  type State,
  type NormalizedTextItem,
  type SourceStatus,
} from "@/types";
import { riskEngine } from "./nlp/riskEngine";
import { collectSources } from "./ingestion/ingestionService";
import { localDemoAdapter } from "./ingestion/localDemoAdapter";
import {
  portfolio,
  runStressTest,
  shouldAutoStress,
} from "./stress/stressEngine";

function append(
  state: State,
  items: NormalizedTextItem[],
  now: Date,
  replay = false,
) {
  const processed = items.map((raw) => {
    const item = NormalizedTextItemSchema.parse({
      ...raw,
      text: cleanText(raw.text),
      title: raw.title ? cleanText(raw.title) : undefined,
    });
    const hash = fingerprint(`${item.title ?? ""} ${item.text}`);
    const existing = state.events.find((e) => e.fingerprint === hash);
    if (existing && !replay) return existing;
    if (existing) {
      state.events = state.events.filter((e) => e !== existing);
      state.stressTests = state.stressTests.filter(
        (s) => s.eventId !== existing.signal.id,
      );
    }
    const signal = riskEngine.analyze(item, now);
    const event = { item, signal, fingerprint: hash };
    state.events.unshift(event);
    if (shouldAutoStress(signal))
      state.stressTests.unshift(runStressTest(signal, portfolio, true, now));
    return event;
  });
  // Bounded local retention keeps the prototype responsive. Scenarios are independent.
  state.events = state.events.slice(0, 500);
  const ids = new Set(state.events.map((e) => e.signal.id));
  state.stressTests = state.stressTests.filter((s) => ids.has(s.eventId));
  state.updatedAt = now.toISOString();
  return processed;
}
async function seededState() {
  const state = await readState();
  if (!state.events.length) {
    const now = new Date();
    const collection = await collectSources(
      process.env.DATA_MODE === "live" ? "live" : "demo",
      now,
    );
    append(state, collection.items, now);
    state.sources = collection.statuses;
    await saveState(state);
  }
  return state;
}
export const getDashboard = () =>
  withStore(async () => {
    const state = await seededState();
    const liveRequested = state.sources.some((s) => s.mode !== "demo");
    const lastCheck = Math.max(
      0,
      ...state.sources.map((s) => Date.parse(s.checkedAt)),
    );
    if (liveRequested && Date.now() - lastCheck > 5 * 60000) {
      const now = new Date();
      const collection = await collectSources("live", now);
      append(state, collection.items, now);
      state.sources = collection.statuses;
      await saveState(state);
    }
    return { ...state, portfolio };
  });
export const processItems = (
  items: NormalizedTextItem[],
  statuses?: SourceStatus[],
  replay = false,
) =>
  withStore(async () => {
    const state = await seededState();
    const previousFingerprints = new Set(
      state.events.map((e) => e.fingerprint),
    );
    const processed = append(state, items, new Date(), replay);
    if (statuses) state.sources = statuses;
    await saveState(state);
    return {
      processed,
      added: new Set(
        processed
          .filter((e) => !previousFingerprints.has(e.fingerprint))
          .map((e) => e.fingerprint),
      ).size,
      stressTests: state.stressTests.filter((s) =>
        processed.some((e) => e.signal.id === s.eventId),
      ),
    };
  });
export async function ingest(mode: "live" | "demo", scenario?: string) {
  if (scenario)
    return processItems(
      localDemoAdapter("news", new Date(), scenario),
      undefined,
      true,
    );
  const { items, statuses } = await collectSources(mode);
  return processItems(items, statuses);
}
export const stressEvent = (id: string) =>
  withStore(async () => {
    const state = await seededState();
    const event = state.events.find((e) => e.signal.id === id);
    if (!event) return null;
    const existing = state.stressTests.find((s) => s.eventId === id);
    if (existing) return existing;
    const result = runStressTest(event.signal, portfolio, false);
    state.stressTests.unshift(result);
    state.updatedAt = new Date().toISOString();
    await saveState(state);
    return result;
  });
