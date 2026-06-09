// Tide data scraper for Manila, Philippines
// Source: tidetime.org (PAGASA-derived data)
// Run: npm run fetch-tides
// Reference port: Manila (Port of Manila)
// All times in Philippine Standard Time (UTC+8)

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://www.tidetime.org/asia/philippines/manila-calendar";
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const DELAY_MS = 600;

const TIDES_DIR = join(__dirname, "..", "src", "data", "tides");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function parseHeight(cellText) {
  const match = cellText.match(/(-?[\d.]+)\s*m/);
  if (!match) return null;
  return `${match[1]}m`;
}

function parseMonth(html, monthIndex) {
  const yearMatch = html.match(/<title>[^|]*\|\s*\w+\s+(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  const rows = [];
  const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    rows.push(trMatch[1]);
  }

  const monthData = {};

  for (const row of rows) {
    const thMatch = row.match(/<th>(\d{1,2})\s/i);
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
        const height = parseHeight(heightMatch[1].trim());
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

  return { year, month: monthIndex + 1, data: monthData };
}

async function fetchMonth(monthIndex) {
  const mon = MONTHS[monthIndex];
  const url = `${BASE_URL}-${mon}.htm`;
  console.log(`  Fetching ${url} ...`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CalendarTideScraper/1.0)",
      "Accept": "text/html",
    },
  });

  if (!res.ok) {
    console.error(`  FAILED: ${res.status} ${res.statusText}`);
    return null;
  }

  const html = await res.text();
  return parseMonth(html, monthIndex);
}

async function main() {
  console.log("Fetching Manila tide data from tidetime.org ...\n");

  mkdirSync(TIDES_DIR, { recursive: true });

  const scraped = {};

  for (let i = 0; i < 12; i++) {
    const parsed = await fetchMonth(i);
    if (parsed) {
      const { year, month, data } = parsed;
      if (!scraped[year]) scraped[year] = {};
      scraped[year][month] = data;
      const days = Object.keys(data).length;
      console.log(`  -> ${year}-${String(month).padStart(2,"0")}: ${days} days`);
    }
    if (i < 11) await sleep(DELAY_MS);
  }

  for (const [year, newMonths] of Object.entries(scraped)) {
    const filePath = join(TIDES_DIR, `tides-${year}.json`);

    let existing = {};
    if (existsSync(filePath)) {
      try { existing = JSON.parse(readFileSync(filePath, "utf-8")); } catch {}
    }

    const merged = { ...existing };
    for (const [month, days] of Object.entries(newMonths)) {
      merged[month] = days;
    }

    writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
    const monthCount = Object.keys(merged).length;
    const dayCount = Object.values(merged).reduce((s, m) => s + Object.keys(m).length, 0);
    console.log(`\nSaved ${filePath}`);
    console.log(`  ${year}: ${monthCount} months, ${dayCount} days`);
  }

  console.log("\nDone. Per-year files in src/data/tides/");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
