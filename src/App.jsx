import React from "react";
import ControlPanel from "./components/ControlPanel";
import CalendarPreview from "./components/CalendarPreview";
import useCalendar from "./hooks/useCalendar";

export default function App() {
  const {
    year,
    month,
    setYear,
    setMonth,
    weeks,
    daysMeta,
    monthName,
  } = useCalendar();

  return (
    <div className="app">
      <ControlPanel
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
      />
      <CalendarPreview
        year={year}
        month={month}
        monthName={monthName}
        weeks={weeks}
        daysMeta={daysMeta}
      />
    </div>
  );
}
