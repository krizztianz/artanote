"use client";

import { useEffect, useRef, useState } from "react";
import { formatMonthLabel } from "@/lib/format";

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

type MonthPickerProps = {
  id?: string;
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
};

/**
 * Month/year picker with explicit prev/next year navigation, replacing the
 * native <input type="month"> whose built-in calendar UI can't change year
 * without many clicks (and renders inconsistently across browsers).
 */
export function MonthPicker({ id, value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.split("-")[0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [selectedYear, selectedMonth] = value.split("-").map(Number);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleOpen() {
    setOpen((o) => {
      const next = !o;
      if (next) setYear(Number(value.split("-")[0]));
      return next;
    });
  }

  function selectMonth(monthIndex: number) {
    onChange(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function goToCurrentMonth() {
    const now = new Date();
    onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleOpen}
        className="theme-control flex w-full items-center justify-between gap-2 p-2.5 text-left text-sm sm:w-44"
      >
        <span>{formatMonthLabel(value)}</span>
        <svg
          className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {open && (
        <div role="dialog" aria-label="Pilih bulan" className="theme-popover absolute left-0 z-20 mt-1 w-64 p-3 sm:left-auto sm:right-0">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              onClick={() => setYear((y) => y - 1)}
              className="theme-option rounded p-1 text-muted"
            >
              &#x2039;
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">{year}</span>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              onClick={() => setYear((y) => y + 1)}
              className="theme-option rounded p-1 text-muted"
            >
              &#x203a;
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MONTH_ABBR.map((label, index) => {
              const isSelected = year === selectedYear && index + 1 === selectedMonth;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectMonth(index)}
                  className="theme-option rounded px-2 py-1.5 text-sm"
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-center border-t border-gray-100 pt-2 dark:border-gray-600">
            <button
              type="button"
              onClick={goToCurrentMonth}
              className="theme-link text-xs"
            >
              Bulan ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
