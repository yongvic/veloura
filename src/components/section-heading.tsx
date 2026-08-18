import { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  body,
  aside
}: {
  kicker: string;
  title: string;
  body?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {body ? <p className="section-copy">{body}</p> : null}
      </div>
      {aside}
    </div>
  );
}
