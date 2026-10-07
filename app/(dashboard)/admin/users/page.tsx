"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  Button,
  Label,
  TextInput,
  Select,
  Alert,
  Badge,
  Spinner,
  Table,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  TableCell,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
} from "flowbite-react";

type Role = "ADMIN" | "USER";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("USER");
  const [resetPassword, setResetPassword] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menambah user");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    await loadUsers();
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setEditName(user.name ?? "");
    setEditEmail(user.email);
    setEditRole(user.role);
    setResetPassword(false);
    setEditPassword("");
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditError(null);
    setEditSubmitting(true);

    const payload: Record<string, unknown> = {
      name: editName,
      email: editEmail,
      role: editRole,
    };
    if (resetPassword) {
      payload.password = editPassword;
    }

    const res = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error ?? "Gagal menyimpan perubahan");
      return;
    }

    setEditing(null);
    await loadUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini? Semua data transaksi & kategorinya akan ikut terhapus.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Gagal menghapus user");
      return;
    }
    await loadUsers();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola User</h1>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tambah User Baru
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          User yang dibuat di sini wajib mengganti password saat login pertama kali.
        </p>
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap" onSubmit={handleCreate}>
          {error && (
            <div className="w-full">
              <Alert color="failure">{error}</Alert>
            </div>
          )}
          <div className="flex-1 min-w-[160px]">
            <Label htmlFor="name">Nama</Label>
            <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label htmlFor="password">Password Default</Label>
            <TextInput
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="min-w-[140px]">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            Tambah User
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Nama</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>
                  <span className="sr-only">Aksi</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {users.map((user) => (
                <TableRow key={user.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <TableCell>{user.name ?? "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge color={user.role === "ADMIN" ? "purple" : "gray"} className="w-fit">
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.mustChangePassword ? (
                      <Badge color="warning" className="w-fit">Wajib ganti password</Badge>
                    ) : (
                      <Badge color="success" className="w-fit">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => openEdit(user)}>
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        disabled={user.id === currentUserId}
                        onClick={() => handleDelete(user.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada user
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal show={editing !== null} onClose={() => setEditing(null)}>
        <ModalHeader>Edit User</ModalHeader>
        <form onSubmit={handleEditSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {editError && <Alert color="failure">{editError}</Alert>}
              <div>
                <Label htmlFor="editName">Nama</Label>
                <TextInput id="editName" required value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <TextInput
                  id="editEmail"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select
                  id="editRole"
                  value={editRole}
                  disabled={editing?.id === currentUserId}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                {editing?.id === currentUserId && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tidak bisa mengubah role akun sendiri.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="resetPassword"
                  checked={resetPassword}
                  onChange={(e) => setResetPassword(e.target.checked)}
                />
                <Label htmlFor="resetPassword">Reset password user ini</Label>
              </div>
              {resetPassword && (
                <div>
                  <Label htmlFor="editPassword">Password Baru</Label>
                  <TextInput
                    id="editPassword"
                    type="password"
                    required
                    minLength={8}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    User akan wajib mengganti password ini saat login berikutnya.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" disabled={editSubmitting}>
              {editSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              Simpan
            </Button>
            <Button color="light" onClick={() => setEditing(null)}>
              Batal
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
