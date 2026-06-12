import React from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, getDay, addMonths, subMonths,
} from "date-fns";
import CalendarGrid from "./CalendarGrid";
import { getAllHolidaysForYear } from "../data/philippineHolidays";
import { getEffectiveDimensions } from "./ControlPanel";

function MiniCalendar({ date, label }) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const monthNum = format(date, "MM");
  const monthName = format(date, "MMMM");
  const yearNum = format(date, "yyyy");

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <span>{monthNum}</span>
        <span className="mini-cal-month-label">{monthName}</span>
        <span>{yearNum}</span>
      </div>
      <div className="mini-cal-grid">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
          <div key={d} className={`mini-cal-weekday ${i === 0 ? "sunday" : ""}`}>{d.charAt(0)}</div>
        ))}
        {days.map((day, i) => {
          const isSun = getDay(day) === 0;
          const inMonth = day.getMonth() === date.getMonth();
          return (
            <div key={i} className={`mini-cal-day ${isSun ? "sunday" : ""}`}>
              {inMonth ? day.getDate() : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPreview({ year, month, monthName, weeks, daysMeta, paperSize, orientation }) {
  const prevMonth = subMonths(new Date(year, month - 1), 1);
  const nextMonth = addMonths(new Date(year, month - 1), 1);

  const allHolidays = getAllHolidaysForYear(year);
  const monthHolidays = allHolidays.filter((h) => h.month === month);
  const displayHolidays = allHolidays.slice(0, 10);

  const pad = (n) => String(n).padStart(2, "0");

  const dims = getEffectiveDimensions(paperSize, orientation);
  const isLandscape = orientation === "landscape";

  return (
    <div
      className="calendar-preview"
      style={{ aspectRatio: `${dims.width} / ${dims.height}` }}
    >
      <div className={`calendar-page${isLandscape ? " landscape" : ""}`}>
        {/* Meander border frame */}
        <div className="border-outer" />
        <div className="border-inner-white" />
        <div className="meander-1" />
        <div className="meander-1-fill" />
        <div className="meander-2" />
        <div className="meander-2-fill" />
        <div className="border-inner" />

        {/* Content */}
        <div className="calendar-content">
          {/* Ad Space */}
          <div className="ad-space">
            <span>Ad Space</span>
          </div>

          {/* Month/Year Banner */}
          <div className="month-banner">
            <div className="month-banner-num">
              <span>{pad(month)}</span>
            </div>
            <div className="month-banner-name">
              <span>{monthName}</span>
            </div>
            <div className="month-banner-year">
              <span>{year}</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid year={year} month={month} monthName={monthName} weeks={weeks} daysMeta={daysMeta} />

          {/* Footer: Mini Calendars + Holidays */}
          <div className="calendar-footer">
            <MiniCalendar date={prevMonth} />

            <div className="holidays-section">
              <div className="holidays-header">
                <span>Legal Holidays in the Philippines</span>
              </div>
              <div className="holidays-grid">
                {displayHolidays.map((h, i) => (
                  <div key={i} className="holiday-item">
                    <span className="holiday-item-date">
                      {pad(h.month)} {pad(h.day)}
                    </span>
                    <span className="holiday-item-name">{h.name.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <MiniCalendar date={nextMonth} />
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-bar">
            <span className="high-note">Figures above indicate HIGH TIDE.</span>
            <span className="disclaimer-text">
              The Printer shall not assume responsibility or liability for any typographical errors or any inaccurate information contained within the material.
            </span>
            <span className="low-note">Figures below indicate LOW TIDE.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
