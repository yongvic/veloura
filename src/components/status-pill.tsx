import { ReactNode } from "react";

import { cx } from "@/components/cx";

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "accent" | "success";
}) {
  return <span className={cx("status-pill", `status-pill--${tone}`)}>{children}</span>;
}
