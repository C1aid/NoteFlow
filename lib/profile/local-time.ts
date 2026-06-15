export function formatProfileLocalTime(date = new Date(), timeZone?: string) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);

  return `${time} local time`;
}
