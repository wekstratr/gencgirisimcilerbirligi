"use client";

import { QRCodeCanvas } from "qrcode.react";

/**
 * Renders a scannable QR code pointing at a public storefront URL
 * (a phone detail page or a restaurant menu page).
 */
export function QRCodeDisplay({
  url,
  label,
  size = 220,
}: {
  url: string;
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-bg p-6 shadow">
      <QRCodeCanvas value={url} size={size} includeMargin fgColor="#1F2937" bgColor="#FFFFFF" />
      {label && <p className="text-sm text-surface-text/70">{label}</p>}
      <a href={url} className="break-all text-xs text-primary underline">
        {url}
      </a>
    </div>
  );
}
