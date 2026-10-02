import companies from "../../../data/company-map.json";
import { containsPhrase } from "@/lib/text";
export function extractEntities(text: string) {
  const matched = companies.filter((c) =>
    [c.name, c.ticker, ...c.aliases].some((alias) =>
      containsPhrase(text, alias),
    ),
  );
  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "China",
    "Japan",
    "Germany",
    "France",
  ].filter((c) => containsPhrase(text, c));
  const institutions = [
    "Federal Reserve",
    "European Central Bank",
    "Reserve Bank of India",
    "World Bank",
    "IMF",
  ].filter((c) => containsPhrase(text, c));
  return {
    company: matched[0]?.name,
    ticker: matched[0]?.ticker,
    entities: [
      ...new Set([
        ...matched.map((c) => c.name),
        ...countries,
        ...institutions,
      ]),
    ],
    sectors: [...new Set(matched.map((c) => c.sector))],
  };
}
