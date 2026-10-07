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
  }

  function goToCurrentMonth() {
    const now = new Date();
    onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-44"
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
        <div className="absolute z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-700">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              onClick={() => setYear((y) => y - 1)}
              className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              &#x2039;
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">{year}</span>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              onClick={() => setYear((y) => y + 1)}
              className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
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
                  onClick={() => selectMonth(index)}
                  className={`rounded px-2 py-1.5 text-sm ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
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
              className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
            >
              Bulan ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
