import React from "react";
import { getDay, format } from "date-fns";
import { isHoliday, getHolidayName } from "../data/philippineHolidays";
import { getChineseLunarDate, getMoonPhasesForMonth } from "../data/lunarPhases";
import { getTideData } from "../data/tideData";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PHASE_SVGS = {
  "FULL MOON": (
    <svg className="moon-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#cc0000"/>
      <circle cx="14" cy="17" r="2.2" fill="white"/>
      <circle cx="26" cy="17" r="2.2" fill="white"/>
      <path d="M13 26 Q20 31 27 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "LAST QUARTER": (
    <svg className="moon-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#cc0000" strokeWidth="2"/>
      <path d="M20 3 A17 17 0 0 0 20 37 Z" fill="#cc0000"/>
      <circle cx="14" cy="17" r="2.2" fill="white"/>
      <path d="M13 26 Q20 31 27 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "NEW MOON": (
    <svg className="moon-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="#cc0000"/>
      <circle cx="14" cy="17" r="2.2" fill="white"/>
      <circle cx="26" cy="17" r="2.2" fill="white"/>
      <path d="M13 26 Q20 31 27 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "FIRST QUARTER": (
    <svg className="moon-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#cc0000" strokeWidth="2"/>
      <path d="M20 3 A17 17 0 0 1 20 37 Z" fill="#cc0000"/>
      <circle cx="26" cy="17" r="2.2" fill="white"/>
      <path d="M13 26 Q20 31 27 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

function assignPhasesToEmptyCells(emptySlots, phases) {
  const assignment = {};
  if (emptySlots.length === 0 || phases.length === 0) return assignment;

  const leadingSlots = emptySlots.filter((s) => s.type === "leading");
  const trailingSlots = emptySlots.filter((s) => s.type === "trailing");

  for (const phase of phases) {
    let slot = null;
    if (phase.day <= 15) {
      slot = leadingSlots.find((s) => !s.used);
      if (!slot) slot = trailingSlots.find((s) => !s.used);
    } else {
      slot = trailingSlots.find((s) => !s.used);
      if (!slot) slot = leadingSlots.find((s) => !s.used);
    }
    if (slot) {
      slot.used = true;
      assignment[slot.index] = phase;
    }
  }
  return assignment;
}

function MoonPhaseCell({ phase }) {
  const monthAbbr = format(new Date(2026, 0, 1), "MMM").toUpperCase();
  const dateStr = `${String(phase.day).padStart(2, "0")}`;
  return (
    <div className="day-cell moon-phase-cell">
      <div className="moon-phase-content">
        <div className="moon-phase-label">{phase.phase}</div>
        {PHASE_SVGS[phase.phase]}
        <div className="moon-phase-date">{phase.time}</div>
      </div>
    </div>
  );
}

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

          <div className="day-number-area">
            <span className="day-number">{dayNum}</span>
            <span className="chinese-numeral">{lunarDate}</span>
          </div>

          {holiday && <div className="holiday-label">{holidayName}</div>}

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

function EmptyCell() {
  return <div className="day-cell other-month" />;
}

export default function CalendarGrid({ year, month, weeks, daysMeta }) {
  const phases = getMoonPhasesForMonth(year, month);

  const emptySlots = [];
  let firstRealRow = -1;
  let lastRealRow = -1;

  for (let wi = 0; wi < weeks.length; wi++) {
    for (let di = 0; di < 7; di++) {
      const day = weeks[wi]?.[di];
      if (day) {
        const meta = daysMeta.find((d) => d.date.getTime() === day.getTime());
        if (meta?.isCurrentMonth) {
          if (firstRealRow === -1) firstRealRow = wi;
          lastRealRow = wi;
        }
      }
    }
  }

  let flatIdx = 0;
  for (let wi = 0; wi < weeks.length; wi++) {
    for (let di = 0; di < 7; di++) {
      const day = weeks[wi]?.[di];
      const meta = day ? daysMeta.find((d) => d.date.getTime() === day.getTime()) : null;
      const isInMonth = meta?.isCurrentMonth ?? false;
      if (!isInMonth) {
        const slotType = wi <= firstRealRow ? "leading" : "trailing";
        emptySlots.push({ index: flatIdx, wi, di, type: slotType, used: false });
      }
      flatIdx++;
    }
  }

  const assignment = assignPhasesToEmptyCells(emptySlots, phases);

  const cells = [];
  let cellIdx = 0;

  for (let wi = 0; wi < weeks.length; wi++) {
    const week = weeks[wi];
    for (let di = 0; di < 7; di++) {
      const idx = cellIdx;
      cellIdx++;

      const day = week[di];
      if (!day) {
        if (assignment[idx]) {
          cells.push(<MoonPhaseCell key={`mp-${idx}`} phase={assignment[idx]} />);
        } else {
          cells.push(<EmptyCell key={`e-${idx}`} />);
        }
        continue;
      }

      const meta = daysMeta.find((d) => d.date.getTime() === day.getTime());
      if (!meta || !meta.isCurrentMonth) {
        if (assignment[idx]) {
          cells.push(<MoonPhaseCell key={`mp-${idx}`} phase={assignment[idx]} />);
        } else {
          cells.push(<EmptyCell key={`e-${idx}`} />);
        }
        continue;
      }

      cells.push(
        <DayCell
          key={`d-${wi}-${di}`}
          year={year}
          month={month}
          dayNum={meta.dayOfMonth}
          inMonth={meta.isCurrentMonth}
          isSunday={meta.isSunday}
        />
      );
    }
  }

  return (
    <div className="calendar-grid-wrapper" style={{ '--week-rows': weeks.length }}>
      {WEEKDAY_LABELS.map((label, i) => (
        <div key={label} className={`weekday-header ${i === 0 ? "sunday" : ""}`}>
          <span>{label}</span>
        </div>
      ))}
      {cells}
    </div>
  );
}
