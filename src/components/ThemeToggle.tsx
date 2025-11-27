"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const initialize = () => {
      setMounted(true);
      const stored = localStorage.getItem("theme");
      const prefersDark = globalThis.window?.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = stored === "dark" || (!stored && prefersDark);
      setIsDark(shouldBeDark);

      // Ensure DOM reflects initial theme immediately (in case head script didn't run)
      const html = document.documentElement;
      if (shouldBeDark) {
        html.classList.add("dark");
        html.style.colorScheme = "dark";
      } else {
        html.classList.remove("dark");
        html.style.colorScheme = "light";
      }
    };
    
    // Use Promise to defer setState and avoid React warning
    Promise.resolve().then(initialize);
  }, []);

  const toggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-9 w-16 items-center justify-center rounded-md border border-(--border) text-sm"
        aria-label="Loading theme toggle"
      >
        <span className="h-4 w-4 animate-pulse rounded-full bg-(--surface-muted)" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-2 rounded-md border border-(--border) px-3 py-1.5 text-sm transition-colors hover:bg-(--surface-muted)"
    >
      <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
