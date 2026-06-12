// Deal start_date/end_date are usually date-only strings ("YYYY-MM-DD") from
// <input type="date">. `new Date("YYYY-MM-DD")` parses as UTC midnight, which is
// the *previous* evening in the US (UTC-4/5) — so deals expired a day early,
// "starts today" checks misfired, and displays showed the wrong day. These
// helpers parse such strings as LOCAL dates and treat the end date inclusively.

export function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = String(value);
  // Full datetime (has a time component) — let Date handle it normally.
  if (s.includes("T")) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Local start-of-day for the deal's start date.
export function dealStart(deal) {
  const d = parseLocalDate(deal?.start_date);
  if (!d) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// Local END-of-day for the deal's end date — inclusive through 23:59:59.999,
// so a deal "valid until June 15" stays active all of June 15.
export function dealEnd(deal) {
  const d = parseLocalDate(deal?.end_date);
  if (!d) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

// Date-window check only (does NOT consider is_active — callers handle that).
export function isWithinDealWindow(deal, now = new Date()) {
  const start = dealStart(deal);
  const end = dealEnd(deal);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

// Display helper: "Jun 15, 2026" in local time.
export function formatDealDate(value, fallback = "") {
  const d = parseLocalDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
