import { Info, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
export function Tip({ text }: { text: string }) {
  return (
    <span className="tip" tabIndex={0} aria-label={text}>
      <Info size={13} />
      <span role="tooltip">{text}</span>
    </span>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "negative" | "positive" | "neutral" | "warning";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function SectionTitle({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function Kpi({
  title,
  value,
  foot,
  tone = "",
  tip,
}: {
  title: string;
  value: string;
  foot: string;
  tone?: string;
  tip: string;
}) {
  return (
    <div className="kpi">
      <div className="kpi-label">
        {title}
        <Tip text={tip} />
      </div>
      <div className={`kpi-value ${tone}`}>{value}</div>
      <div className="kpi-foot">
        <ArrowUpRight size={12} />
        {foot}
      </div>
    </div>
  );
}
