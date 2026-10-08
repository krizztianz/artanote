"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "flowbite-react";
import { appTheme } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={appTheme}>{children}</ThemeProvider>
    </SessionProvider>
  );
}
