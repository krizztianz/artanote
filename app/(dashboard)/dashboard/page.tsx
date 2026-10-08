"use client";

import { useEffect, useState } from "react";
import { Card, Label, Spinner, Badge } from "flowbite-react";
import { CATEGORY_TYPE_LABELS } from "@/lib/category-labels";
import { formatCurrency, formatMonthLabel, currentMonthValue } from "@/lib/format";
import { MonthPicker } from "@/components/MonthPicker";
import type { CategoryType } from "@prisma/client";

type Summary = {
  month: string;
  totals: {
    income: number;
    mandatoryExpense: number;
    emergencyFund: number;
    savings: number;
    remainingToSave: number;
  };
  byCategory: {
    categoryId: string;
    name: string;
    type: CategoryType;
    total: number;
  }[];
};

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonthValue());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading state before refetching on month change
    setLoading(true);
    fetch(`/api/summary?month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setSummary(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [month]);

  const remaining = summary?.totals.remainingToSave ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ringkasan Bulanan
        </h1>
        <div className="flex flex-col gap-1">
          <Label htmlFor="monthFilter" className="block text-sm font-medium">
            Bulan
          </Label>
          <MonthPicker id="monthFilter" value={month} onChange={setMonth} />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      )}

      {!loading && summary && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Periode: {formatMonthLabel(summary.month)}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pemasukan (Gaji)</span>
              <span className="text-2xl font-bold text-brand">
                {formatCurrency(summary.totals.income)}
              </span>
            </Card>
            <Card>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pengeluaran Wajib</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totals.mandatoryExpense)}
              </span>
            </Card>
            <Card className="bg-accent-soft dark:bg-accent-soft">
              <span className="text-sm text-gray-500 dark:text-gray-400">Dana Darurat</span>
              <span className="text-2xl font-bold text-warning">
                {formatCurrency(summary.totals.emergencyFund)}
              </span>
            </Card>
            <Card className={remaining >= 0 ? "bg-brand-soft dark:bg-brand-soft" : "border-red-400 dark:border-red-400"}>
              <span className="text-sm text-gray-500 dark:text-gray-400">Sisa Bisa Ditabung</span>
              <span
                className={`text-2xl font-bold ${
                  remaining >= 0
                    ? "text-brand"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(remaining)}
              </span>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rincian per Kategori
            </h2>
            {summary.byCategory.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada transaksi di bulan ini.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {summary.byCategory.map((item) => (
                  <li
                    key={item.categoryId}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <Badge color="gray">{CATEGORY_TYPE_LABELS[item.type]}</Badge>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
