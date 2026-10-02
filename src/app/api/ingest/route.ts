import { handle, json, parseBody } from "@/lib/api";
import { IngestSchema } from "@/types";
import { ingest } from "@/services/pipeline";
export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, IngestSchema);
    if (input.mode === "live" && input.scenario)
      return json({ error: "Demo scenarios require mode: demo" }, 400);
    const result = await ingest(input.mode, input.scenario);
    return json(result, result.added ? 201 : 200);
  });
}
