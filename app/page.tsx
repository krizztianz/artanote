import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        💰 ArtaNote
      </h1>
      <p className="max-w-xl text-gray-600 dark:text-gray-300">
        Catat gaji, pengeluaran wajib, dan dana darurat setiap bulan, lalu
        langsung tahu berapa sisa yang bisa kamu tabung.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          Masuk
        </Link>
      </div>
    </main>
  );
}
