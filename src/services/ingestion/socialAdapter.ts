import { fetchFeed } from "./rss";
export const socialAdapter = () =>
  fetchFeed(
    process.env.SOCIAL_FEED_URL || "https://www.reddit.com/r/finance/.rss",
    "Public discussion RSS",
    "social",
  );
