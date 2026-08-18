import type { ReactNode } from "react";
import { cx } from "@/components/cx";

export type StatusPillTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "gold"
  | "muted"
  | "warning";

export function StatusPill({
  children,
  tone = "neutral",
  size = "md",
  icon,
  className
}: {
  children: ReactNode;
  tone?: StatusPillTone;
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "status-pill",
        `status-pill--${tone}`,
        size === "sm" && "status-pill--sm",
        className
      )}
    >
      {icon ? <span className="status-pill__icon">{icon}</span> : null}
      <span className="status-pill__label">{children}</span>
    </span>
  );
}
