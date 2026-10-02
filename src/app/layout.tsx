import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "RiskPulse AI | Financial Risk Intelligence",
  description:
    "Real-Time AI Financial Risk Intelligence & Event-Driven Portfolio Stress Testing Platform. Educational prototype with synthetic data.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
