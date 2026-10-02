import { describe, it, expect, vi } from "vitest";
import { parseFeed } from "@/services/ingestion/rss";
import { collectSources } from "@/services/ingestion/ingestionService";
import { cleanText, fingerprint } from "@/lib/text";
describe("source adapters and preprocessing", () => {
  it("parses dated RSS and Atom into the common schema", () => {
    const rss =
      "<rss><channel><item><title>Credit downgrade</title><description>Company credit downgrade</description><link>https://example.com/article</link><pubDate>Thu, 01 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>";
    expect(parseFeed(rss, "Test news", "news")[0]).toMatchObject({
      sourceType: "news",
      isDemo: false,
      title: "Credit downgrade",
    });
    const atom =
      '<feed><entry><title>Discussion of earnings</title><content>Record profit</content><link href="https://example.com/discussion" rel="alternate"/><updated>2026-10-01T10:00:00Z</updated></entry></feed>';
    expect(parseFeed(atom, "Test social", "social")[0].url).toBe(
      "https://example.com/discussion",
    );
  });
  it("rejects empty, unsafe declarations and missing dates", () => {
    expect(() => parseFeed("<rss/>", "Test", "news")).toThrow();
    expect(() =>
      parseFeed(
        '<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>',
        "Test",
        "news",
      ),
    ).toThrow();
    expect(() =>
      parseFeed(
        "<rss><channel><item><title>Missing date</title></item></channel></rss>",
        "Test",
        "news",
      ),
    ).toThrow();
  });
  it("automatically falls back independently when live feeds fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    try {
      const r = await collectSources("live");
      expect(r.statuses.map((s) => s.mode)).toEqual(["fallback", "fallback"]);
      expect(new Set(r.items.map((i) => i.sourceType)).size).toBe(2);
      expect(r.items.every((i) => i.isDemo)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("does not call the network in offline mode", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    try {
      const r = await collectSources("demo");
      expect(r.items).toHaveLength(15);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("cleans HTML and deduplicates text consistently", () => {
    expect(cleanText("<script>bad()</script><p>Credit &amp; risk</p>")).toBe(
      "Credit & risk",
    );
    expect(fingerprint("<b>Credit downgrade.</b>")).toBe(
      fingerprint("credit DOWNGRADE!"),
    );
  });
});
