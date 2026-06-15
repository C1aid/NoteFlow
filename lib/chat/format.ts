export function formatMessageTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(typeof date === "string" ? new Date(date) : date);
}

function ordinal(day: number) {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

export function formatMessageDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(value);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(value);
  const day = value.getDate();

  return `${weekday}, ${month} ${ordinal(day)}`;
}

export function isSameDay(a: string | Date, b: string | Date) {
  const left = typeof a === "string" ? new Date(a) : a;
  const right = typeof b === "string" ? new Date(b) : b;

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isMessageEdited(createdAt: string, updatedAt: string) {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return updated - created > 60_000;
}

export function formatLastReplyLabel(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000);

  if (seconds < 60) return "Last reply just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Last reply ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last reply ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Last reply 1 day ago";
  return `Last reply ${days} days ago`;
}
