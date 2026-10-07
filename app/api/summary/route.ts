import { NextResponse } from "next/server";
import { CategoryType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Format bulan tidak valid (YYYY-MM)" }, { status: 400 });
  }

  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1));
  const end = new Date(Date.UTC(year, m, 1));

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: start, lt: end } },
    include: { category: true },
  });

  const totalsByType: Record<CategoryType, number> = {
    INCOME: 0,
    MANDATORY_EXPENSE: 0,
    EMERGENCY_FUND: 0,
    SAVINGS: 0,
  };

  const byCategory = new Map<
    string,
    { categoryId: string; name: string; type: CategoryType; total: number }
  >();

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    totalsByType[tx.category.type] += amount;

    const key = tx.categoryId;
    const existing = byCategory.get(key);
    if (existing) {
      existing.total += amount;
    } else {
      byCategory.set(key, {
        categoryId: tx.categoryId,
        name: tx.category.name,
        type: tx.category.type,
        total: amount,
      });
    }
  }

  const totalIncome = totalsByType.INCOME;
  const totalMandatoryExpense = totalsByType.MANDATORY_EXPENSE;
  const totalEmergencyFund = totalsByType.EMERGENCY_FUND;
  const totalSavings = totalsByType.SAVINGS;
  const remainingToSave = totalIncome - totalMandatoryExpense - totalEmergencyFund;

  return NextResponse.json({
    month,
    totals: {
      income: totalIncome,
      mandatoryExpense: totalMandatoryExpense,
      emergencyFund: totalEmergencyFund,
      savings: totalSavings,
      remainingToSave,
    },
    byCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
  });
}
