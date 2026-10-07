"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Label,
  TextInput,
  Select,
  Alert,
  Badge,
  Spinner,
} from "flowbite-react";
import { CategoryType } from "@prisma/client";
import { CATEGORY_TYPE_LABELS } from "@/lib/category-labels";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
  isPreset: boolean;
};

const TYPE_OPTIONS: CategoryType[] = [
  CategoryType.INCOME,
  CategoryType.MANDATORY_EXPENSE,
  CategoryType.EMERGENCY_FUND,
  CategoryType.SAVINGS,
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(CategoryType.MANDATORY_EXPENSE);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menambah kategori");
      return;
    }

    setName("");
    await loadCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Gagal menghapus kategori");
      return;
    }
    await loadCategories();
  }

  const grouped = useMemo(() => {
    const map = new Map<CategoryType, Category[]>();
    for (const t of TYPE_OPTIONS) map.set(t, []);
    for (const cat of categories) {
      map.get(cat.type)?.push(cat);
    }
    return map;
  }, [categories]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori</h1>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tambah Kategori Baru
        </h2>
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          {error && (
            <div className="w-full sm:order-last">
              <Alert color="failure">{error}</Alert>
            </div>
          )}
          <div className="flex-1">
            <Label htmlFor="name">Nama Kategori</Label>
            <TextInput
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Listrik"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="type">Tipe</Label>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {CATEGORY_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            Tambah
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TYPE_OPTIONS.map((t) => (
            <Card key={t}>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {CATEGORY_TYPE_LABELS[t]}
              </h3>
              <ul className="flex flex-col gap-2">
                {grouped.get(t)?.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      {cat.isPreset ? (
                        <Badge color="info">Preset</Badge>
                      ) : (
                        <Button size="xs" color="failure" onClick={() => handleDelete(cat.id)}>
                          Hapus
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {grouped.get(t)?.length === 0 && (
                  <li className="text-sm text-gray-500 dark:text-gray-400">
                    Belum ada kategori
                  </li>
                )}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
