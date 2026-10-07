import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <div className="flex min-h-screen flex-col">{children}</div>;
}
