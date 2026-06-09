import React, { useEffect, useRef } from "react";
import CalendarPreview from "./CalendarPreview";
import { computeMonthData } from "../utils/calendarData";
import { getEffectiveDimensions } from "./ControlPanel";

export default function YearPrintLayout({ year, paperSize, orientation, onReady }) {
  const containerRef = useRef(null);
  const firedRef = useRef(false);
  const months = Array.from({ length: 12 }, (_, i) => computeMonthData(year, i + 1));
  const dims = getEffectiveDimensions(paperSize, orientation);

  useEffect(() => {
    if (!containerRef.current || !onReady || firedRef.current) return;
    firedRef.current = true;

    const images = containerRef.current.querySelectorAll("img");
    let loaded = 0;
    const total = images.length;

    if (total === 0) {
      onReady();
      return;
    }

    const checkDone = () => {
      loaded++;
      if (loaded >= total) onReady();
    };

    images.forEach((img) => {
      if (img.complete) {
        checkDone();
      } else {
        img.addEventListener("load", checkDone);
        img.addEventListener("error", checkDone);
      }
    });
  }, [onReady]);

  return (
    <div ref={containerRef} className="year-print-layout">
      {months.map((m) => (
        <div
          key={m.month}
          className="year-print-page"
          style={{
            width: `${dims.width}in`,
            height: `${dims.height}in`,
            overflow: "hidden",
            pageBreakAfter: "always",
            breakAfter: "page",
          }}
        >
          <CalendarPreview
            year={m.year}
            month={m.month}
            monthName={m.monthName}
            weeks={m.weeks}
            daysMeta={m.daysMeta}
            paperSize={paperSize}
            orientation={orientation}
          />
        </div>
      ))}
    </div>
  );
}
