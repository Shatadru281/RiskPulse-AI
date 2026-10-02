import { handle, json, parseBody } from "@/lib/api";
import { StressRequestSchema } from "@/types";
import { stressEvent, getDashboard } from "@/services/pipeline";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () =>
    json({ stressTests: (await getDashboard()).stressTests }),
  );
}
export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, StressRequestSchema);
    const result = await stressEvent(input.eventId);
    return result
      ? json(result)
      : json({ error: "Risk signal not found" }, 404);
  });
}
