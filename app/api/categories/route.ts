import { NextResponse } from "next/server";
import { z } from "zod";
import { CategoryType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(60),
  type: z.nativeEnum(CategoryType),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { isPreset: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const { name, type } = parsed.data;

  const existing = await prisma.category.findFirst({
    where: { userId: session.user.id, name, type },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Kategori dengan nama dan tipe ini sudah ada" },
      { status: 409 },
    );
  }

  const category = await prisma.category.create({
    data: { name, type, userId: session.user.id, isPreset: false },
  });

  return NextResponse.json(category, { status: 201 });
}
