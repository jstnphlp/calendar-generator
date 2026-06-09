import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";

export function computeMonthData(year, month) {
  const dateObj = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(dateObj);
  const monthEnd = endOfMonth(dateObj);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const daysMeta = allDays.map((d) => ({
    date: d,
    dayOfMonth: d.getDate(),
    isCurrentMonth: isSameMonth(d, dateObj),
    isToday: isToday(d),
    isSunday: getDay(d) === 0,
    monthLabel: format(d, "MMM"),
  }));

  return {
    year,
    month,
    weeks,
    daysMeta,
    monthName: format(dateObj, "MMMM"),
  };
}
