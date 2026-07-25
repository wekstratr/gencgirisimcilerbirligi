import type { ThemeConfig } from "@/lib/types";

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#3B82F6",
  secondary: "#10B981",
  background: "#FFFFFF",
  text: "#1F2937",
  logo: null,
};

/** "#3B82F6" -> "59 130 246" (space-separated RGB, required for Tailwind's rgb(var(--x) / <alpha-value>) trick) */
function hexToRgbTriplet(hex: string): string {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(
    normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

/**
 * Turns a tenant's theme_config into an inline <style> string of CSS variables.
 * Render this once near the root of a tenant-scoped layout (see components/ThemeProvider.tsx).
 */
export function themeToCssVariables(theme: ThemeConfig): string {
  const t = { ...DEFAULT_THEME, ...theme };
  return `
    --color-primary: ${hexToRgbTriplet(t.primary)};
    --color-secondary: ${hexToRgbTriplet(t.secondary)};
    --color-background: ${hexToRgbTriplet(t.background)};
    --color-text: ${hexToRgbTriplet(t.text)};
  `;
}

export const PRESET_PALETTES: { name: string; theme: Partial<ThemeConfig> }[] = [
  { name: "Ocean", theme: { primary: "#0EA5E9", secondary: "#14B8A6" } },
  { name: "Sunset", theme: { primary: "#F97316", secondary: "#EF4444" } },
  { name: "Forest", theme: { primary: "#16A34A", secondary: "#65A30D" } },
  { name: "Royal", theme: { primary: "#7C3AED", secondary: "#DB2777" } },
  { name: "Classic", theme: { primary: "#3B82F6", secondary: "#10B981" } },
];
