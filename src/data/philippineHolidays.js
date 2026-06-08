export const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 2, day: 25, name: "EDSA People Power Revolution Anniversary" },
  { month: 4, day: 9, name: "Araw ng Kagitingan (Day of Valor)" },
  { month: 5, day: 1, name: "Labor Day" },
  { month: 6, day: 12, name: "Independence Day" },
  { month: 8, day: 21, name: "Ninoy Aquino Day" },
  { month: 8, day: 26, name: "National Heroes Day" },
  { month: 11, day: 1, name: "All Saints' Day" },
  { month: 11, day: 2, name: "All Souls' Day" },
  { month: 11, day: 30, name: "Bonifacio Day" },
  { month: 12, day: 8, name: "Feast of the Immaculate Conception" },
  { month: 12, day: 24, name: "Christmas Eve" },
  { month: 12, day: 25, name: "Christmas Day" },
  { month: 12, day: 30, name: "Rizal Day" },
  { month: 12, day: 31, name: "Last Day of the Year" },
];

export function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getMoveableHolidays(year) {
  const easter = getEasterSunday(year);
  const maundyThursday = new Date(easter);
  maundyThursday.setDate(easter.getDate() - 3);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const blackSaturday = new Date(easter);
  blackSaturday.setDate(easter.getDate() - 1);

  return [
    { month: maundyThursday.getMonth() + 1, day: maundyThursday.getDate(), name: "Maundy Thursday" },
    { month: goodFriday.getMonth() + 1, day: goodFriday.getDate(), name: "Good Friday" },
    { month: blackSaturday.getMonth() + 1, day: blackSaturday.getDate(), name: "Black Saturday" },
  ];
}

export function getHolidaysForMonth(year, month) {
  const fixed = FIXED_HOLIDAYS.filter((h) => h.month === month);
  const moveable = getMoveableHolidays(year).filter((h) => h.month === month);
  return [...fixed, ...moveable];
}

export function getAllHolidaysForYear(year) {
  const fixed = FIXED_HOLIDAYS;
  const moveable = getMoveableHolidays(year);
  return [...fixed, ...moveable].sort((a, b) => a.month - b.month || a.day - b.day);
}

export function isHoliday(year, month, day) {
  const all = [...FIXED_HOLIDAYS, ...getMoveableHolidays(year)];
  return all.some((h) => h.month === month && h.day === day);
}

export function getHolidayName(year, month, day) {
  const all = [...FIXED_HOLIDAYS, ...getMoveableHolidays(year)];
  const match = all.find((h) => h.month === month && h.day === day);
  return match ? match.name : null;
}
