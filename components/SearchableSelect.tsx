"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type SearchableSelectProps = {
  id?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Text-searchable dropdown ("combobox") used in place of a plain <select>
 * for lists long enough that scanning/typing is faster than scrolling.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((opt) => opt.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

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
      if (next) setQuery("");
      return next;
    });
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
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
        onClick={toggleOpen}
        className="theme-control flex w-full items-center justify-between gap-2 p-2.5 text-left text-sm"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <svg
          className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="theme-popover absolute right-0 z-20 mt-1 w-full min-w-56">
          <div className="border-b border-gray-100 p-2 dark:border-gray-600">
            <input
              ref={inputRef}
              type="text"
              aria-label={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="theme-control w-full px-2 py-1.5 text-sm placeholder:text-muted"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  aria-pressed={opt.value === value}
                  onClick={() => handleSelect(opt.value)}
                  className="theme-option flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.hint && (
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{opt.hint}</span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ditemukan</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
