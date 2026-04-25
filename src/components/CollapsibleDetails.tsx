"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

export default function CollapsibleDetails({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  // Default open for SSR; collapsed on mobile after hydration
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(window.innerWidth >= 1024);
  }, []);

  return (
    <details
      className={className}
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      {children}
    </details>
  );
}
