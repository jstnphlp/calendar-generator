// Tide data scraper for Manila, Philippines
// Source: tidetime.org (PAGASA-derived data)
// Run: npm run fetch-tides
// Reference port: Manila (Port of Manila)
// All times in Philippine Standard Time (UTC+8)

import { writeFileSync, mkdirSync } from "fs";
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

function parseMonth(html, monthIndex) {
  const titleMatch = html.match(/<title>[^<]*?(\d{4})/);
  const year = titleMatch ? parseInt(titleMatch[1], 10) : new Date().getFullYear() + 1;

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

    if (tides.length === 1 || tides.length === 3) {
      console.warn(`  ⚠ Day ${day}: unusual tide count ${tides.length}, attempting fallback parse`);
      const fallbackRegex = /(High|Low)[^<]*?(\d{1,2}:\d{2}\s*(?:am|pm))[^<]*?(-?\d+\.?\d*)\s*m/gi;
      let fbMatch;
      const existingTimes = new Set(tides.map((t) => t.time));
      while ((fbMatch = fallbackRegex.exec(row)) !== null) {
        const type = fbMatch[1].toLowerCase() === "high" ? "HT" : "LT";
        const time = parseTime12to24(fbMatch[2].trim());
        const height = fbMatch[3].trim() + "m";
        if (time && !existingTimes.has(time)) {
          tides.push({ type, time, height });
          existingTimes.add(time);
          console.warn(`    -> Fallback recovered: ${type} ${time} ${height}`);
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
      const with4 = Object.values(data).filter((t) => t.length === 4).length;
      const with2 = Object.values(data).filter((t) => t.length === 2).length;
      const with3 = Object.values(data).filter((t) => t.length === 3).length;
      const with1 = Object.values(data).filter((t) => t.length === 1).length;
      console.log(`  -> ${year}-${String(month).padStart(2, "0")}: ${days} days (4:${with4} 3:${with3} 2:${with2} 1:${with1})`);
    }
    if (i < 11) await sleep(DELAY_MS);
  }

  for (const [year, newMonths] of Object.entries(scraped)) {
    const filePath = join(TIDES_DIR, `tides-${year}.json`);
    writeFileSync(filePath, JSON.stringify(newMonths, null, 2) + "\n");
    const monthCount = Object.keys(newMonths).length;
    const dayCount = Object.values(newMonths).reduce((s, m) => s + Object.keys(m).length, 0);
    console.log(`\nSaved ${filePath}`);
    console.log(`  ${year}: ${monthCount} months, ${dayCount} days`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
