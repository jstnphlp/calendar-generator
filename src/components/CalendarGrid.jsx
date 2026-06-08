import React from "react";
import { getDay } from "date-fns";
import { isHoliday, getHolidayName } from "../data/philippineHolidays";
import { getChineseLunarDate } from "../data/lunarPhases";
import { getTideData } from "../data/tideData";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function DayCell({ year, month, dayNum, inMonth, isSunday }) {
  const holiday = isHoliday(year, month, dayNum) && inMonth;
  const holidayName = getHolidayName(year, month, dayNum);
  const lunarDate = getChineseLunarDate(year, month, dayNum);
  const tides = getTideData(year, month, dayNum);

  const highTides = tides.filter((t) => t.type === "HT");
  const lowTides = tides.filter((t) => t.type === "LT");

  const cellClasses = [
    "day-cell",
    !inMonth && "other-month",
    isSunday && inMonth && "sunday",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cellClasses}>
      {inMonth && (
        <div className="day-cell-inner">
          <div className="tide-row high-tide">
            {highTides.map((t, i) => (
              <span key={i}>{t.time} {t.height}</span>
            ))}
          </div>

          {holiday && <div className="holiday-label">{holidayName}</div>}

          <div className="day-number-area">
            <span className="day-number">{dayNum}</span>
            <span className="chinese-numeral">{lunarDate}</span>
          </div>

          <div className="tide-row low-tide">
            {lowTides.map((t, i) => (
              <span key={i}>{t.time} {t.height}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarGrid({ year, month, weeks, daysMeta }) {
  return (
    <div className="calendar-grid-wrapper">
      {WEEKDAY_LABELS.map((label, i) => (
        <div key={label} className={`weekday-header ${i === 0 ? "sunday" : ""}`}>
          <span>{label}</span>
        </div>
      ))}

      {weeks.map((week, wi) =>
        week.map((day, di) => {
          const meta = daysMeta.find(
            (d) => d.date.getTime() === day.getTime()
          );
          if (!meta) return <div key={`${wi}-${di}`} className="day-cell other-month" />;

          return (
            <DayCell
              key={`${wi}-${di}`}
              year={year}
              month={month}
              dayNum={meta.dayOfMonth}
              inMonth={meta.isCurrentMonth}
              isSunday={meta.isSunday}
            />
          );
        })
      )}
    </div>
  );
}
