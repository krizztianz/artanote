import { CategoryType } from "@prisma/client";

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  INCOME: "Pemasukan",
  MANDATORY_EXPENSE: "Pengeluaran Wajib",
  EMERGENCY_FUND: "Dana Darurat",
  SAVINGS: "Tabungan",
};
