import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  body,
  aside,
  className
}: {
  kicker?: string;
  title: string;
  body?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`section-heading ${className ?? ""}`.trim()}>
      <div className="section-heading__text">
        {kicker ? <span className="section-heading__kicker">{kicker}</span> : null}
        <h2 className="section-heading__title">{title}</h2>
        {body ? <p className="section-heading__body">{body}</p> : null}
      </div>
      {aside ? <div className="section-heading__aside">{aside}</div> : null}
    </div>
  );
}
