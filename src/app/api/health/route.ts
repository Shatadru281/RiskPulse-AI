import { json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  return json({
    status: "ok",
    app: "RiskPulse AI",
    version: "1.0.0",
    model: "local-lexicon-v1",
    mode: process.env.DATA_MODE === "live" ? "live" : "demo",
    storage: "local JSON; one Node process",
    timestamp: new Date().toISOString(),
  });
}
