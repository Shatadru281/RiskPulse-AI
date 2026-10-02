import { json } from "@/lib/api";
import { portfolio } from "@/services/stress/stressEngine";
export const dynamic = "force-dynamic";
export async function GET() {
  return json({
    label: "SYNTHETIC DATA — DEMONSTRATION ONLY",
    currency: "USD",
    totalValue: portfolio.reduce((n, p) => n + p.marketValue, 0),
    positions: portfolio,
  });
}
