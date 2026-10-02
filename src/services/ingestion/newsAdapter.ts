import { fetchFeed } from "./rss";
export const newsAdapter = () =>
  fetchFeed(
    process.env.NEWS_FEED_URL ||
      "https://feeds.bbci.co.uk/news/business/rss.xml",
    "Financial news RSS",
    "news",
  );
