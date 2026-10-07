import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100).optional(),
  email: z.string().email("Email tidak valid").optional(),
  role: z.nativeEnum(Role).optional(),
  // Optional password reset: when provided, the user is forced to change
  // it again on next login.
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== Role.ADMIN) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const { name, email, role, password } = parsed.data;

  // Safety rail: an Admin can't change their own role, to avoid
  // accidentally locking every Admin out of /admin.
  if (role && id === session!.user.id && role !== target.role) {
    return NextResponse.json(
      { error: "Tidak bisa mengubah role akun sendiri" },
      { status: 400 },
    );
  }

  if (email && email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(password !== undefined
        ? { passwordHash: await bcrypt.hash(password, 10), mustChangePassword: true }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (id === session!.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
