import { CategoryType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Preset categories created automatically for every new user.
 * Users can still add their own custom categories under each type.
 */
export const PRESET_CATEGORIES: { name: string; type: CategoryType }[] = [
  { name: "Gaji", type: CategoryType.INCOME },
  { name: "Pengeluaran Wajib", type: CategoryType.MANDATORY_EXPENSE },
  { name: "Dana Darurat", type: CategoryType.EMERGENCY_FUND },
  { name: "Tabungan", type: CategoryType.SAVINGS },
];

export async function seedPresetCategoriesForUser(userId: string) {
  await prisma.category.createMany({
    data: PRESET_CATEGORIES.map((category) => ({
      ...category,
      userId,
      isPreset: true,
    })),
    skipDuplicates: true,
  });
}

export { CATEGORY_TYPE_LABELS } from "@/lib/category-labels";
