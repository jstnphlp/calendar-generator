import React from "react";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const PAPER_SIZES = [
  { value: "a4",      label: "A4 (8.27×11.69\")",     width: 8.27, height: 11.69, unit: "in" },
  { value: "legal",   label: "Legal (8.5×13\")",      width: 8.5,  height: 13,    unit: "in" },
  { value: "legal14", label: "Legal (8.5×14\")",      width: 8.5,  height: 14,    unit: "in" },
  { value: "a3",      label: "A3 (11.69×16.54\")",    width: 11.69,height: 16.54, unit: "in" },
  { value: "tabloid", label: "Tabloid (11×17\")",      width: 11,   height: 17,    unit: "in" },
  { value: "poster15",label: "Poster (15×21\")",       width: 15,   height: 21,    unit: "in" },
  { value: "poster17",label: "Poster (17×22\")",       width: 17,   height: 22,    unit: "in" },
  { value: "poster18",label: "Poster (18×24\")",       width: 18,   height: 24,    unit: "in" },
  { value: "xl",      label: "Extra Large (22×34\")",  width: 22,   height: 34,    unit: "in" },
];

export { PAPER_SIZES };

export default function ControlPanel({ year, month, onYearChange, onMonthChange, paperSize, onPaperSizeChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handlePrint = () => {
    const selected = PAPER_SIZES.find((p) => p.value === paperSize) || PAPER_SIZES[0];
    const styleEl = document.createElement("style");
    styleEl.id = "dynamic-page-size";
    styleEl.innerHTML = `@page { size: ${selected.width}in ${selected.height}in; margin: 0; }`;
    const existing = document.getElementById("dynamic-page-size");
    if (existing) existing.remove();
    document.head.appendChild(styleEl);
    window.print();
  };

  return (
    <div className="control-panel no-print">
      <div className="control-group">
        <label htmlFor="year-select">Year</label>
        <select
          id="year-select"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="month-select">Month</label>
        <select
          id="month-select"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="paper-select">Size</label>
        <select
          id="paper-select"
          value={paperSize}
          onChange={(e) => onPaperSizeChange(e.target.value)}
        >
          {PAPER_SIZES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <button className="print-btn" onClick={handlePrint}>
        Print / Export PDF
      </button>
    </div>
  );
}
