"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let accountCreated = false;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        setError(
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Gagal mendaftar. Silakan coba lagi.",
        );
        return;
      }

      accountCreated = true;
      setRegistered(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Akun berhasil dibuat, tetapi login otomatis gagal. Silakan masuk melalui halaman login.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        accountCreated
          ? "Akun berhasil dibuat, tetapi login otomatis gagal. Silakan masuk melalui halaman login."
          : "Tidak dapat menyelesaikan pendaftaran. Periksa koneksi dan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.png" alt="ArtaNote" width={72} height={81} priority />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Buat Akun Baru
          </h1>
        </div>
        {error && <Alert color="failure">{error}</Alert>}
        {!registered && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Nama</Label>
              <TextInput
                id="name"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <TextInput
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimal 8 karakter
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Daftar
            </Button>
          </form>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:underline dark:text-blue-500">
            Masuk di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
