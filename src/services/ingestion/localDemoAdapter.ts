import news from "../../../data/demo-news.json";
import social from "../../../data/demo-social.json";
import { NormalizedTextItemSchema } from "@/types";
export function localDemoAdapter(
  type: "news" | "social",
  now = new Date(),
  scenario?: string,
) {
  const rows = type === "news" ? news : social;
  return rows
    .filter((row) => !scenario || row.id === `demo-news-${scenario}`)
    .map((row, i) =>
      NormalizedTextItemSchema.parse({
        ...row,
        publishedAt: new Date(now.getTime() - i * 12 * 60000).toISOString(),
      }),
    );
}
