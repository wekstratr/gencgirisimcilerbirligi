"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeConfig } from "@/lib/types";
import { themeToCssVariables } from "@/lib/theme";

/**
 * Wraps the app with next-themes (dark/light toggle) and, when a tenant theme
 * is supplied, injects that tenant's brand colors as CSS variables so
 * Tailwind's `text-primary` / `bg-primary` / etc. reflect that tenant's palette.
 */
export function ThemeProvider({
  children,
  tenantTheme,
}: {
  children: React.ReactNode;
  tenantTheme?: ThemeConfig;
}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {tenantTheme && (
        <style
          // Scoped to :root so it applies globally for this tenant-scoped subtree/page.
          dangerouslySetInnerHTML={{
            __html: `:root { ${themeToCssVariables(tenantTheme)} }`,
          }}
        />
      )}
      {children}
    </NextThemesProvider>
  );
}
