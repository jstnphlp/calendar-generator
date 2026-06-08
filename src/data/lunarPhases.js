const LUNAR_TERMS = [
  "初一", "初二", "初三", "初四", "初五",
  "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五",
  "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五",
  "廿六", "廿七", "廿八", "廿九", "三十",
];

const PHASE_SYMBOLS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

function getLunarDayApprox(year, month, day) {
  const date = new Date(year, month - 1, day);
  const referenceNewMoon = new Date(2000, 0, 6, 18, 14);
  const lunarCycle = 29.53058770576;
  const daysSinceRef = (date - referenceNewMoon) / (1000 * 60 * 60 * 24);
  const cyclePosition = ((daysSinceRef % lunarCycle) + lunarCycle) % lunarCycle;
  return Math.floor(cyclePosition);
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

export function isNewMoon(year, month, day) {
  const lunarDay = getLunarDayApprox(year, month, day);
  return lunarDay <= 1 || lunarDay >= 28;
}

export function isFullMoon(year, month, day) {
  const lunarDay = getLunarDayApprox(year, month, day);
  return lunarDay >= 13 && lunarDay <= 16;
}
