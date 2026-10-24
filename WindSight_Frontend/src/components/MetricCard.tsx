
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}

export default function MetricCard({
  label,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <p className="metric-description">{description}</p>
    </article>
  );
}
