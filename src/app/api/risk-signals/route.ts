import { handle, json } from "@/lib/api";
import { getDashboard } from "@/services/pipeline";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () =>
    json({ signals: (await getDashboard()).events.map((e) => e.signal) }),
  );
}
