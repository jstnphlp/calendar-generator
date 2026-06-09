import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TIDES_DIR = join(__dirname, "..", "src", "data", "tides");
const MONTHS_SHORT = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const BASE_URL = "https://www.tidetime.org/asia/philippines/manila-calendar";

function getTidesFilePath(year) {
  return join(TIDES_DIR, `tides-${year}.json`);
}

function readTidesFile(year) {
  const path = getTidesFilePath(year);
  if (!existsSync(path)) return {};
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return {}; }
}

function writeTidesFile(year, data) {
  mkdirSync(TIDES_DIR, { recursive: true });
  writeFileSync(getTidesFilePath(year), JSON.stringify(data, null, 2) + "\n");
}

function parseTime12to24(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

function parseMonthHTML(html, monthIndex) {
  const monthData = {};
  const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const row = trMatch[1];
    const thMatch = row.match(/<th>(\d{1,2})\s/);
    if (!thMatch) continue;
    const day = parseInt(thMatch[1], 10);

    const tides = [];
    const tdRegex = /<td>([\s\S]*?)<\/td>/gi;
    let tdMatch;

    while ((tdMatch = tdRegex.exec(row)) !== null) {
      const cell = tdMatch[1];
      if (cell.includes("&nbsp;") || !cell.includes("tidal-state")) continue;

      const stateMatch = cell.match(/class="tidal-state">(High|Low)/i);
      const timeMatch = cell.match(/class="tidal-time">([^<]+)/i);
      const heightMatch = cell.match(/class="m">([^<]+)/i);

      if (stateMatch && timeMatch && heightMatch) {
        const type = stateMatch[1].toLowerCase() === "high" ? "HT" : "LT";
        const time = parseTime12to24(timeMatch[1].trim());
        const height = heightMatch[1].trim().replace(/\s*m$/, "m");
        if (time && height) {
          tides.push({ type, time, height });
        }
      }
    }

    if (tides.length > 0) {
      tides.sort((a, b) => a.time.localeCompare(b.time));
      monthData[day] = tides;
    }
  }

  return monthData;
}

export async function fetchTidesForMonth(year, month = null) {
  const monthsToFetch = month
    ? [month - 1]
    : Array.from({ length: 12 }, (_, i) => i);

  const existing = readTidesFile(year);
  let fetched = 0;

  for (const mi of monthsToFetch) {
    const mon = MONTHS_SHORT[mi];
    const url = `${BASE_URL}-${mon}.htm`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CalendarTideScraper/1.0)" },
    });
    if (!res.ok) throw new Error(`Failed to fetch ${mon}: ${res.status}`);
    const html = await res.text();
    const parsed = parseMonthHTML(html, mi);
    existing[String(mi + 1)] = parsed;
    fetched++;
    if (mi < monthsToFetch[monthsToFetch.length - 1]) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  writeTidesFile(year, existing);
  return { year, month, fetched, monthsStored: Object.keys(existing).length };
}

export async function deleteTideData(year, month = null) {
  const path = getTidesFilePath(year);
  if (!existsSync(path)) return { deleted: false, reason: "File not found" };

  if (month === null) {
    unlinkSync(path);
    return { deleted: true, scope: `${year} (entire year)` };
  } else {
    const data = readTidesFile(year);
    const key = String(month);
    if (!data[key]) return { deleted: false, reason: "Month not found in file" };
    delete data[key];
    if (Object.keys(data).length === 0) {
      unlinkSync(path);
    } else {
      writeTidesFile(year, data);
    }
    return { deleted: true, scope: `${year}-${String(month).padStart(2, "0")}` };
  }
}
