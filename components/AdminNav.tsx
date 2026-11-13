"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "Bookings"],
  ["/admin/calendar", "Calendar"],
  ["/admin/services", "Services"],
  ["/admin/hours", "Hours"],
  ["/admin/clients", "Clients"],
] as const;

export default function AdminNav() {
  const p = usePathname();
  return (
    <nav className="ad-nav" aria-label="Admin">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={p === href ? "on" : ""}>{label}</Link>
      ))}
    </nav>
  );
}
