import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { hasYearTideData, loadTideDataForYear } from "../data/tideData";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PHASES = {
  IDLE: "idle",
  CHECKING: "checking",
  FETCHING: "fetching",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
};

export default function SaveYearPdfDialog({ open, onOpenChange, year, paperSize, orientation, onPrint }) {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [error, setError] = useState("");
  const [dataReady, setDataReady] = useState(false);

  const reset = useCallback(() => {
    setPhase(PHASES.IDLE);
    setFetchProgress(0);
    setCurrentMonth(0);
    setError("");
    setDataReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    setPhase(PHASES.CHECKING);
    if (hasYearTideData(year)) {
      setPhase(PHASES.READY);
      setDataReady(true);
    } else {
      setPhase(PHASES.READY);
      setDataReady(false);
    }
  }, [open, year, reset]);

  async function handleFetchTides() {
    setPhase(PHASES.FETCHING);
    setFetchProgress(0);
    setError("");

    try {
      for (let m = 1; m <= 12; m++) {
        setCurrentMonth(m);
        setFetchProgress(((m - 1) / 12) * 100);

        const res = await fetch("/api/fetch-tides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year, month: m }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || `Failed to fetch ${MONTH_NAMES[m - 1]}`);
        }
      }

      setFetchProgress(100);
      setPhase(PHASES.LOADING);

      const loaded = await loadTideDataForYear(year);
      if (!loaded) {
        throw new Error("Failed to load tide data after fetching");
      }

      setDataReady(true);
      setPhase(PHASES.READY);
    } catch (e) {
      setError(e.message);
      setPhase(PHASES.ERROR);
    }
  }

  function handlePrint() {
    onOpenChange(false);
    setTimeout(() => {
      onPrint(year, paperSize, orientation);
    }, 200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[Anton] text-xl tracking-wide uppercase">
            Save {year} to PDF
          </DialogTitle>
          <DialogDescription>
            {phase === PHASES.CHECKING && "Checking tide data availability..."}
            {phase === PHASES.READY && dataReady && "All tide data is ready for this year."}
            {phase === PHASES.READY && !dataReady && "Tide data has not been fetched for this year yet."}
            {phase === PHASES.FETCHING && `Fetching tide data for ${MONTH_NAMES[currentMonth - 1]}...`}
            {phase === PHASES.LOADING && "Loading tide data into memory..."}
            {phase === PHASES.ERROR && "Something went wrong."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {phase === PHASES.CHECKING && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking tide data for {year}...</span>
            </div>
          )}

          {phase === PHASES.FETCHING && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Fetching {MONTH_NAMES[currentMonth - 1]}...
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {currentMonth}/12
                </span>
              </div>
              <Progress value={fetchProgress} className="h-2" />
            </div>
          )}

          {phase === PHASES.LOADING && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading tide data...</span>
            </div>
          )}

          {phase === PHASES.READY && dataReady && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Tide data ready for all 12 months.</span>
            </div>
          )}

          {phase === PHASES.READY && !dataReady && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>Tide data for {year} has not been scraped yet.</span>
              </div>
              <button
                onClick={handleFetchTides}
                className="w-full px-4 py-2 bg-[#003399] text-white font-bold text-sm uppercase tracking-wide hover:bg-[#002277] transition-colors cursor-pointer"
              >
                Fetch Tide Data for {year}
              </button>
            </div>
          )}

          {phase === PHASES.ERROR && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleFetchTides}
                className="w-full px-4 py-2 bg-[#003399] text-white font-bold text-sm uppercase tracking-wide hover:bg-[#002277] transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {phase === PHASES.READY && dataReady && (
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#cc0000] text-white font-bold text-sm uppercase tracking-wide hover:bg-[#a30000] transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Print / Save as PDF
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
