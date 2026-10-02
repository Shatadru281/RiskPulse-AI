import { NextResponse } from "next/server";
import { z } from "zod";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Use Content-Type: application/json");
  // Stream limit protects even requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "JSON body is required");
  const decoder = new TextDecoder();
  let body = "",
    bytes = 0;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > 65536) throw new ApiError(413, "Body exceeds 64 KB");
      body += decoder.decode(result.value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new ApiError(400, "Malformed JSON");
  }
  return schema.parse(parsed);
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function handle(operation: () => Promise<Response>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        {
          error: "Invalid input",
          details: error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        400,
      );
    if (error instanceof ApiError)
      return json({ error: error.message }, error.status);
    console.error(
      "RiskPulse request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return json(
      {
        error:
          "Unable to complete the request. Check the server log and local storage permissions.",
      },
      500,
    );
  }
}
