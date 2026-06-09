// Real tide data for Manila (Port of Manila)
// Source: tidetime.org — scraped from PAGASA-derived data
// Run `npm run fetch-tides` to refresh this data
// Reference port: Manila, Philippines (14°35'N, 120°58'E)
// All times in Philippine Standard Time (UTC+8)

import tides2026 from "./tides/tides-2026.json";
import tides2027 from "./tides/tides-2027.json";

const YEAR_DATA = {
  2026: tides2026,
  2027: tides2027,
};

export async function loadTideDataForYear(year) {
  if (YEAR_DATA[year]) return true;
  try {
    const res = await fetch(`/api/tides/${year}`);
    if (!res.ok) return false;
    const data = await res.json();
    YEAR_DATA[year] = data;
    return true;
  } catch {
    return false;
  }
}

export function hasYearTideData(year) {
  const yearData = YEAR_DATA[year];
  if (!yearData) return false;
  for (let m = 1; m <= 12; m++) {
    if (!yearData[String(m)] || Object.keys(yearData[String(m)]).length === 0) {
      return false;
    }
  }
  return true;
}

export function getTideData(year, month, day) {
  const yearData = YEAR_DATA[year];
  if (!yearData) return [];
  const tides = yearData[String(month)]?.[String(day)];
  return tides && tides.length > 0 ? tides : [];
}

export function formatTideTime(time24) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function getTideSummary(year, month, day) {
  const tides = getTideData(year, month, day);
  return tides.map((t) => formatTideTime(t.time)).join(" ");
}
