"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const forced = session?.user?.mustChangePassword ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mengganti password");
      setLoading(false);
      return;
    }

    // Refresh the JWT so `mustChangePassword` is false without a full
    // re-login (handled by the "update" trigger in lib/auth.config.ts).
    await update({ mustChangePassword: false });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-t-4 border-t-accent dark:border-t-accent">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.png" alt="ArtaNote" width={72} height={81} priority />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Ganti Password
          </h1>
        </div>
        {forced && (
          <Alert color="warning">
            Demi keamanan, kamu wajib mengganti password default sebelum
            melanjutkan.
          </Alert>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert color="failure">{error}</Alert>}
          <div>
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <TextInput
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Password Baru</Label>
            <TextInput
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimal 8 karakter
            </p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <TextInput
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Simpan Password Baru
          </Button>
        </form>
      </Card>
    </main>
  );
}
