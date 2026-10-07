"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Button,
  Label,
  TextInput,
  Select,
  Alert,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
} from "flowbite-react";
import { CategoryType } from "@prisma/client";
import { CATEGORY_TYPE_LABELS } from "@/lib/category-labels";
import { formatCurrency, currentMonthValue } from "@/lib/format";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
};

type Transaction = {
  id: string;
  amount: string;
  date: string;
  note: string | null;
  category: Category;
};

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [month, setMonth] = useState(currentMonthValue());
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month, page: String(page), pageSize: "10" });
    if (categoryFilter) params.set("categoryId", categoryFilter);
    const res = await fetch(`/api/transactions?${params.toString()}`);
    const data = await res.json();
    setTransactions(data.data);
    setTotalPages(data.pagination.totalPages);
    setLoading(false);
  }, [month, page, categoryFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on filter/page change
    loadTransactions();
  }, [loadTransactions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, date, note, categoryId }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menambah transaksi");
      return;
    }

    setAmount("");
    setNote("");
    setPage(1);
    await loadTransactions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadTransactions();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaksi</h1>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tambah Transaksi
        </h2>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={handleSubmit}>
          {error && (
            <div className="sm:col-span-2 lg:col-span-5">
              <Alert color="failure">{error}</Alert>
            </div>
          )}
          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <Select
              id="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({CATEGORY_TYPE_LABELS[cat.type]})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <TextInput
              id="amount"
              type="number"
              min="0"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <TextInput
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <TextInput id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="sm:col-span-2 lg:col-span-5">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Riwayat Transaksi
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:w-auto sm:flex sm:flex-row">
            <div className="flex flex-col gap-1">
              <Label htmlFor="monthFilter" className="block text-sm font-medium">
                Bulan
              </Label>
              <input
                id="monthFilter"
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-44"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="categoryFilter" className="block text-sm font-medium">
                Kategori
              </Label>
              <Select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-44"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Tanggal</TableHeadCell>
                  <TableHeadCell>Kategori</TableHeadCell>
                  <TableHeadCell>Catatan</TableHeadCell>
                  <TableHeadCell>Jumlah</TableHeadCell>
                  <TableHeadCell>
                    <span className="sr-only">Aksi</span>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <TableCell>{new Date(tx.date).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      {tx.category.name}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {CATEGORY_TYPE_LABELS[tx.category.type]}
                      </span>
                    </TableCell>
                    <TableCell>{tx.note ?? "-"}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(tx.amount))}
                    </TableCell>
                    <TableCell>
                      <Button size="xs" color="failure" onClick={() => handleDelete(tx.id)}>
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
