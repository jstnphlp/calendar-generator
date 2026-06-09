import React, { useState } from "react";
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

  const [paperSize, setPaperSize] = useState("a4");

  return (
    <div className="app">
      <ControlPanel
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
      />
      <CalendarPreview
        year={year}
        month={month}
        monthName={monthName}
        weeks={weeks}
        daysMeta={daysMeta}
        paperSize={paperSize}
      />
    </div>
  );
}
