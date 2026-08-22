/**
 * Formats an event's start/end datetime for display, in either language.
 * - Single-day event (no end, or end is same calendar day): "15 July 2026, 10:00 AM"
 * - Multi-day event (end is a different calendar day): "15–17 July 2026"
 */
export function formatEventDateRange(
  startIso: string,
  endIso: string | null,
  locale: 'hi' | 'en'
): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  const localeTag = locale === 'en' ? 'en-US' : 'hi-IN';

  const sameDay =
    !end ||
    (start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate());

  if (sameDay) {
    const datePart = start.toLocaleDateString(localeTag, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timePart = start.toLocaleTimeString(localeTag, {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const startDay = start.toLocaleDateString(localeTag, { day: 'numeric' });
    const endPart = end.toLocaleDateString(localeTag, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${startDay}\u2013${endPart}`;
  }

  const startPart = start.toLocaleDateString(localeTag, { day: 'numeric', month: 'long' });
  const endPart = end.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${startPart} \u2013 ${endPart}`;
}

/** True if the event's start (or end, if present) is in the future. */
export function isUpcoming(startIso: string, endIso: string | null): boolean {
  const now = new Date();
  const relevant = endIso ? new Date(endIso) : new Date(startIso);
  return relevant.getTime() >= now.getTime();
}
