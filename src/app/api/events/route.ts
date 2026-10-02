import { handle, json } from "@/lib/api";
import { getDashboard } from "@/services/pipeline";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () => json({ events: (await getDashboard()).events }));
}
