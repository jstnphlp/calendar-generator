const TIDE_LABELS = ["LT", "HT", "LT", "HT"];

function getTideDayIndex(year, month, day) {
  const date = new Date(year, month - 1, day);
  const epoch = new Date(2024, 0, 1);
  return Math.floor((date - epoch) / (1000 * 60 * 60 * 24));
}

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function getTideData(year, month, day) {
  const dayIndex = getTideDayIndex(year, month, day);
  const baseSeed = dayIndex * 4;

  const tides = [];
  for (let i = 0; i < 4; i++) {
    const r = seededRandom(baseSeed + i);
    const hour = Math.floor(r * 12) + (i < 2 ? 0 : 12);
    const minute = Math.floor(seededRandom(baseSeed + i + 100) * 60);
    const height = (seededRandom(baseSeed + i + 200) * 2 + 0.3).toFixed(1);
    tides.push({
      type: TIDE_LABELS[i],
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      height: `${height}m`,
    });
  }
  return tides;
}

export function getTideSummary(year, month, day) {
  const tides = getTideData(year, month, day);
  return tides.map((t) => `${t.time}`).join(" ");
}
