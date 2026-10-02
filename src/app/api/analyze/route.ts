import { randomUUID } from "node:crypto";
import { handle, json, parseBody } from "@/lib/api";
import { AnalyzeSchema } from "@/types";
import { processItems } from "@/services/pipeline";
export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, AnalyzeSchema);
    const result = await processItems([
      {
        id: `manual_${randomUUID()}`,
        source: "User supplied text",
        sourceType: input.sourceType,
        title: input.title,
        text: input.text,
        publishedAt: new Date().toISOString(),
        isDemo: false,
      },
    ]);
    return json(
      {
        ...result.processed[0].signal,
        stressTest: result.stressTests[0] ?? null,
        deduplicated: result.added === 0,
      },
      result.added ? 201 : 200,
    );
  });
}
