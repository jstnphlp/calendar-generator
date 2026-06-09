const LUNAR_TERMS = [
  "初一", "初二", "初三", "初四", "初五",
  "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五",
  "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五",
  "廿六", "廿七", "廿八", "廿九", "三十",
];

const PHASE_SYMBOLS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
const LUNAR_CYCLE = 29.53058770576;
const REF_MOON = new Date(2000, 0, 6, 18, 14);

const PHASE_TARGETS = [
  { phase: "NEW MOON", target: 0.0 },
  { phase: "FIRST QUARTER", target: 7.38 },
  { phase: "FULL MOON", target: 14.77 },
  { phase: "LAST QUARTER", target: 22.15 },
];

function getCyclePosition(year, month, day) {
  const date = new Date(year, month - 1, day);
  const daysSinceRef = (date - REF_MOON) / (1000 * 60 * 60 * 24);
  return ((daysSinceRef % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
}

function formatPhaseTime(fractionalDay) {
  const totalMinutes = fractionalDay * 24 * 60;
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function getMoonPhasesForMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const results = [];

  for (const { phase, target } of PHASE_TARGETS) {
    let bestDay = -1;
    let bestDist = Infinity;
    let bestPos = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const pos = getCyclePosition(year, month, d);
      let dist = Math.abs(pos - target);
      if (dist > LUNAR_CYCLE / 2) dist = LUNAR_CYCLE - dist;
      if (dist < bestDist) {
        bestDist = dist;
        bestDay = d;
        bestPos = pos;
      }
    }

    if (bestDay >= 0 && bestDist < 2.0) {
      results.push({
        phase,
        day: bestDay,
        time: formatPhaseTime(bestPos),
      });
    }
  }

  return results;
}

export function getLunarDayApprox(year, month, day) {
  return Math.floor(getCyclePosition(year, month, day));
}

export function getLunarPhase(year, month, day) {
  const lunarDay = getLunarDayApprox(year, month, day);
  const phaseIndex = Math.floor((lunarDay / 29.53) * 8) % 8;
  return PHASE_SYMBOLS[phaseIndex];
}

export function getChineseLunarDate(year, month, day) {
  const lunarDay = getLunarDayApprox(year, month, day);
  return LUNAR_TERMS[lunarDay] || "";
}
