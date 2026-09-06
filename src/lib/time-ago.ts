export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const seconds = Math.floor((Date.now() - time) / 1000);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}
