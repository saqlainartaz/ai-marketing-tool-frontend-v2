import type { ContentItem } from "@/lib/store/content";

const DAY_KEYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Monday of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

/**
 * Resolves an item's day. Fixtures carry weekday keys ("TUE") or "TODAY";
 * the real BFF will carry ISO dates. Both land on a real Date so the
 * month view can place them.
 */
export function resolveItemDate(item: ContentItem): Date | null {
  const key = item.scheduledFor;
  if (!key) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (key === "TODAY") return today;
  const idx = DAY_KEYS.indexOf(key as (typeof DAY_KEYS)[number]);
  if (idx === -1) return null;
  const monday = startOfWeek(today);
  const d = new Date(monday);
  d.setDate(monday.getDate() + idx);
  return d;
}
