import type { NormalizedTextItem, SourceStatus } from "@/types";
import { localDemoAdapter } from "./localDemoAdapter";
import { newsAdapter } from "./newsAdapter";
import { socialAdapter } from "./socialAdapter";
export async function collectSources(mode: "live" | "demo", now = new Date()) {
  const results = await Promise.all(
    (["news", "social"] as const).map(async (type) => {
      let items: NormalizedTextItem[],
        statusMode: SourceStatus["mode"] = mode,
        message = "Fictional offline dataset";
      try {
        items =
          mode === "demo"
            ? localDemoAdapter(type, now)
            : await (type === "news" ? newsAdapter() : socialAdapter());
      } catch (error) {
        statusMode = "fallback";
        message = `Live feed unavailable (${error instanceof Error ? error.message : "network error"}); fictional demo fallback`;
        items = localDemoAdapter(type, now);
      }
      if (statusMode === "live")
        message = "Public RSS / Atom feed; report content is unverified";
      const status: SourceStatus = {
        sourceType: type,
        source: items[0]?.source ?? type,
        mode: statusMode,
        count: items.length,
        message,
        checkedAt: now.toISOString(),
      };
      return { items, status };
    }),
  );
  return {
    items: results.flatMap((r) => r.items),
    statuses: results.map((r) => r.status),
  };
}
