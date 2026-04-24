"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/publications", label: "Publications" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-(--surface-muted)"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-(--border) bg-(--surface)">
          <nav className="px-4 py-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={
                        "block rounded-md px-2 py-2 text-sm uppercase tracking-wide " +
                        (isActive
                          ? "bg-(--surface-muted) ring-1 ring-(--border)"
                          : "hover:bg-(--surface-muted)")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
