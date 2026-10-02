import { XMLParser } from "fast-xml-parser";
import { cleanText, fingerprint } from "@/lib/text";
import { NormalizedTextItemSchema, type NormalizedTextItem } from "@/types";
type XmlObject = Record<string, unknown>;
const object = (value: unknown): XmlObject =>
  typeof value === "object" && value !== null ? (value as XmlObject) : {};
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : v ? [v] : []);
const str = (v: unknown): string =>
  typeof v === "string"
    ? v
    : typeof v === "number"
      ? String(v)
      : typeof v === "object" && v
        ? str(object(v)["#text"])
        : "";
export function parseFeed(
  xml: string,
  source: string,
  sourceType: "news" | "social",
): NormalizedTextItem[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Feed declarations are unsupported");
  const parsed: unknown = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
  }).parse(xml);
  const root = object(parsed);
  const entries = list(
    object(object(root.rss).channel).item ?? object(root.feed).entry,
  );
  const items: NormalizedTextItem[] = [];
  for (const raw of entries.slice(0, 30)) {
    const row = object(raw);
    const title = cleanText(str(row.title));
    const body = cleanText(str(row.description ?? row.content ?? row.summary));
    const text = `${title}. ${body}`.slice(0, 18000);
    const date = new Date(str(row.pubDate ?? row.published ?? row.updated));
    // A missing publication time must not create a false recency signal.
    if (
      !title ||
      !Number.isFinite(date.getTime()) ||
      date.getTime() > Date.now() + 300000
    )
      continue;
    const links = list(row.link);
    const selected =
      links.find((link) => object(link)["@_rel"] === "alternate") ?? links[0];
    const url = str(selected) || str(object(selected)["@_href"]);
    const result = NormalizedTextItemSchema.safeParse({
      id: `${sourceType}_${fingerprint(url || text).slice(0, 16)}`,
      source,
      sourceType,
      title,
      text,
      url: /^https?:\/\//i.test(url) ? url : undefined,
      publishedAt: date.toISOString(),
      author: str(object(row.author).name) || undefined,
      isDemo: false,
    });
    if (result.success) items.push(result.data);
  }
  if (!items.length) throw new Error("Feed contained no valid dated articles");
  return items;
}
export async function fetchFeed(
  url: string,
  source: string,
  type: "news" | "social",
) {
  if (!/^https:\/\//i.test(url)) throw new Error("Feed URL must use HTTPS");
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: {
      "User-Agent": "RiskPulseAI/1.0 (educational RSS reader)",
      Accept: "application/rss+xml, application/atom+xml, application/xml",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body) throw new Error("Empty feed");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0,
    xml = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 2_000_000) throw new Error("Feed exceeds 2 MB limit");
      xml += decoder.decode(chunk.value, { stream: true });
    }
    xml += decoder.decode();
    return parseFeed(xml, source, type);
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}
