import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { StateSchema, type State } from "@/types";
// Shared across route bundles and hot reload. One Node process owns this local store.
const globals = globalThis as typeof globalThis & {
  riskPulseQueue?: Promise<unknown>;
};
export const storagePath = () =>
  path.resolve(
    /* turbopackIgnore: true */ process.env.RISK_STORE_PATH ||
      ".riskpulse/state.json",
  );
export async function readState(): Promise<State> {
  const filename = storagePath();
  try {
    // Runtime state is created after startup and must never be bundled into a deployment.
    return StateSchema.parse(
      JSON.parse(await readFile(/* turbopackIgnore: true */ filename, "utf8")),
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return emptyState();
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && error.name === "ZodError")
    ) {
      const backup = `${filename}.corrupt-${Date.now()}`;
      await rename(filename, backup);
      return {
        ...emptyState(),
        warning: `Invalid local store preserved as ${path.basename(backup)}. Demo data re-seeded.`,
      };
    }
    throw error;
  }
}
function emptyState(): State {
  return {
    version: 1,
    events: [],
    stressTests: [],
    sources: [],
    updatedAt: new Date().toISOString(),
  };
}
export async function saveState(state: State) {
  const filename = storagePath();
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(StateSchema.parse(state)), "utf8");
  await rename(temporary, filename);
}
export function withStore<T>(operation: () => Promise<T>): Promise<T> {
  const result = (globals.riskPulseQueue ?? Promise.resolve()).then(operation);
  globals.riskPulseQueue = result.catch(() => undefined);
  return result;
}
