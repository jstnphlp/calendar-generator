import React, { useState, useCallback, useRef } from "react";
import ControlPanel, { getEffectiveDimensions } from "./components/ControlPanel";
import CalendarPreview from "./components/CalendarPreview";
import SaveYearPdfDialog from "./components/SaveYearPdfDialog";
import YearPrintLayout from "./components/YearPrintLayout";
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
  const [orientation, setOrientation] = useState("portrait");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [printYear, setPrintYear] = useState(null);
  const [printPaperSize, setPrintPaperSize] = useState("a4");
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const printTimeoutRef = useRef(null);
  const printingRef = useRef(false);

  const handleSaveYearPdf = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const handlePrint = useCallback((targetYear, targetPaperSize, targetOrientation) => {
    printingRef.current = false;
    setPrintYear(targetYear);
    setPrintPaperSize(targetPaperSize);
    setPrintOrientation(targetOrientation);
    setPrintMode(true);
  }, []);

  const handlePrintReady = useCallback(() => {
    if (printingRef.current) return;
    printingRef.current = true;

    const dims = getEffectiveDimensions(printPaperSize, printOrientation);
    const styleEl = document.createElement("style");
    styleEl.id = "dynamic-page-size";
    styleEl.innerHTML = `@page { size: ${dims.width}in ${dims.height}in; margin: 0; }`;
    const existing = document.getElementById("dynamic-page-size");
    if (existing) existing.remove();
    document.head.appendChild(styleEl);

    printTimeoutRef.current = setTimeout(() => {
      window.print();

      const handleAfterPrint = () => {
        printingRef.current = false;
        setPrintMode(false);
        setPrintYear(null);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
      window.addEventListener("afterprint", handleAfterPrint);
    }, 500);
  }, [printPaperSize, printOrientation]);

  if (printMode && printYear) {
    return (
      <YearPrintLayout
        year={printYear}
        paperSize={printPaperSize}
        orientation={printOrientation}
        onReady={handlePrintReady}
      />
    );
  }

  return (
    <div className="app">
      <ControlPanel
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onSaveYearPdf={handleSaveYearPdf}
      />
      <CalendarPreview
        year={year}
        month={month}
        monthName={monthName}
        weeks={weeks}
        daysMeta={daysMeta}
        paperSize={paperSize}
        orientation={orientation}
      />
      <SaveYearPdfDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        year={year}
        paperSize={paperSize}
        orientation={orientation}
        onPrint={handlePrint}
      />
    </div>
  );
}
