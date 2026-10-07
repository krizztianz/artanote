import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(60),
});

async function getOwnedCategory(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const category = await getOwnedCategory(session.user.id, id);
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }
  if (category.isPreset) {
    return NextResponse.json(
      { error: "Kategori preset tidak dapat diubah" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const category = await getOwnedCategory(session.user.id, id);
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }
  if (category.isPreset) {
    return NextResponse.json(
      { error: "Kategori preset tidak dapat dihapus" },
      { status: 403 },
    );
  }

  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id },
  });
  if (transactionCount > 0) {
    return NextResponse.json(
      { error: "Kategori masih dipakai oleh transaksi, tidak bisa dihapus" },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
