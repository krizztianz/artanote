"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle, Button } from "flowbite-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transaksi" },
  { href: "/categories", label: "Kategori" },
];

export function DashboardNav({ userName, isAdmin }: { userName: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const navLinks = isAdmin ? [...links, { href: "/admin/users", label: "Admin" }] : links;

  return (
    <Navbar fluid className="border-b border-gray-200 dark:border-gray-700">
      <NavbarBrand as={Link} href="/dashboard">
        <span className="self-center whitespace-nowrap text-lg font-semibold dark:text-white">
          💰 ArtaNote
        </span>
      </NavbarBrand>
      <div className="flex items-center gap-3 md:order-2">
        <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">
          Halo, {userName}
        </span>
        <Button size="sm" color="light" onClick={() => signOut({ callbackUrl: "/login" })}>
          Keluar
        </Button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        {navLinks.map((link) => (
          <NavbarLink
            key={link.href}
            as={Link}
            href={link.href}
            active={pathname === link.href}
          >
            {link.label}
          </NavbarLink>
        ))}
      </NavbarCollapse>
    </Navbar>
  );
}
