"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/publications", label: "Publications" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <ul className="main-nav hidden items-center gap-1 text-sm uppercase tracking-wide lg:flex">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                "relative rounded-full px-3 py-1.5 transition-colors " +
                (isActive
                  ? "bg-(--surface-muted) text-(--text) ring-1 ring-(--border)"
                  : "hover:bg-(--surface-muted)")
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
