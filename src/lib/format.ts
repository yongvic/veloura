export function formatShortDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Date flexible";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
