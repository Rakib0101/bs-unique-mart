export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-US")}`;
}

// The server (Vercel) runs in UTC, but the business and its customers are in
// Bangladesh — always pin display timestamps to Asia/Dhaka rather than
// letting them silently render in the server's local time.
export function formatDhakaDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
}

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => BANGLA_DIGITS[Number(d)]);
}

export function formatTimeAgo(date: Date | string | number): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
