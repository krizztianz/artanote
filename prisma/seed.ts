import { PrismaClient } from "@prisma/client";
import { PRESET_CATEGORIES } from "../lib/categories";

const prisma = new PrismaClient();

/**
 * This seed script only ensures the database connection works and prints
 * the preset categories that will be created per-user upon registration
 * (see lib/categories.ts). It intentionally does not create a demo user,
 * since every real user gets their preset categories seeded automatically
 * when they register via /api/auth/register.
 */
async function main() {
  console.log("Preset categories available for new users:");
  for (const category of PRESET_CATEGORIES) {
    console.log(`  - ${category.name} (${category.type})`);
  }
  console.log("Database connection OK. No demo data was created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
