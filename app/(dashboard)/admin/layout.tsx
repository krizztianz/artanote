import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Defense-in-depth: `proxy.ts` middleware already blocks non-admins from
  // reaching /admin/*, this is a second check at the layout level.
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
