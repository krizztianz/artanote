import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { primaryButton, secondaryButton } from "@/lib/theme";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/logo.png" alt="ArtaNote" width={112} height={126} priority />
      <h1 className="text-3xl font-bold text-brand sm:text-4xl">
        ArtaNote
      </h1>
      <p className="max-w-xl text-muted">
        Catat gaji, pengeluaran wajib, dan dana darurat setiap bulan, lalu
        langsung tahu berapa sisa yang bisa kamu tabung.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className={`rounded-lg px-5 py-2.5 text-sm font-medium focus:ring-2 ${primaryButton}`}
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className={`rounded-lg px-5 py-2.5 text-sm font-medium focus:ring-2 ${secondaryButton}`}
        >
          Daftar
        </Link>
      </div>
    </main>
  );
}
