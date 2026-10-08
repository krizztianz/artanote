"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-t-4 border-t-accent dark:border-t-accent">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.png" alt="ArtaNote" width={72} height={81} priority />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Masuk ke Akun
          </h1>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert color="failure">{error}</Alert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Masuk
          </Button>
        </form>
        <p className="text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="theme-link">
            Daftar di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
