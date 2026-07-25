"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: next-themes only knows the real theme client-side.
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Tema değiştir"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-lg transition hover:bg-primary/10"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
