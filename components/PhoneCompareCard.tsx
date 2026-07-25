import type { Phone } from "@/lib/types";
import clsx from "clsx";

export type ComparablePhone = Pick
  Phone,
  "id" | "brand" | "model" | "ram_gb" | "storage_gb" | "price" | "condition"
>;

type ComparisonRow = {
  label: string;
  getValue: (p: ComparablePhone) => string;
  getComparable: (p: ComparablePhone) => number;
  higherIsBetter: boolean;
};

// Defines each spec row shown in the comparison table, and how to decide a "winner".
const ROWS: ComparisonRow[] = [
  {
    label: "RAM",
    getValue: (p) => `${p.ram_gb} GB`,
    getComparable: (p) => p.ram_gb,
    higherIsBetter: true,
  },
  {
    label: "Depolama",
    getValue: (p) => `${p.storage_gb} GB`,
    getComparable: (p) => p.storage_gb,
    higherIsBetter: true,
  },
  {
    label: "Fiyat",
    getValue: (p) => `${p.price.toLocaleString("tr-TR")} ₺`,
    getComparable: (p) => p.price,
    higherIsBetter: false, // lower price wins
  },
  {
    label: "Durum",
    getValue: (p) => (p.condition === "new" ? "Sıfır" : "İkinci El"),
    getComparable: (p) => (p.condition === "new" ? 1 : 0),
    higherIsBetter: true,
  },
];

function Arrow({ direction }: { direction: "left" | "right" | "none" }) {
  if (direction === "none") return <span className="text-surface-text/30">—</span>;
  return (
    <span
      className={clsx(
        "text-lg font-bold text-secondary",
        direction === "left" ? "-scale-x-100" : ""
      )}
      aria-label={direction === "left" ? "Sol cihaz kazandı" : "Sağ cihaz kazandı"}
    >
      ➜
    </span>
  );
}

/**
 * Mobile-first side-by-side comparison table. For each spec row, an arrow
 * points at the winning device (e.g. higher RAM, lower price).
 */
export function PhoneCompareCard({ left, right }: { left: ComparablePhone; right: ComparablePhone }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface-bg shadow">
      <div className="grid grid-cols-2 gap-2 border-b border-primary/10 p-4 text-center">
        <div>
          <p className="font-semibold">{left.brand} {left.model}</p>
        </div>
        <div>
          <p className="font-semibold">{right.brand} {right.model}</p>
        </div>
      </div>

      <div className="divide-y divide-primary/10">
        {ROWS.map((row) => {
          const leftVal = row.getComparable(left);
          const rightVal = row.getComparable(right);
          let winner: "left" | "right" | "none" = "none";
          if (leftVal !== rightVal) {
            const leftWins = row.higherIsBetter ? leftVal > rightVal : leftVal < rightVal;
            winner = leftWins ? "left" : "right";
          }

          return (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 text-sm">
              <span
                className={clsx(
                  "text-center",
                  winner === "left" && "font-bold text-secondary"
                )}
              >
                {row.getValue(left)}
              </span>
              <div className="flex flex-col items-center gap-0.5 text-[10px] text-surface-text/50">
                <span>{row.label}</span>
                <Arrow direction={winner} />
              </div>
              <span
                className={clsx(
                  "text-center",
                  winner === "right" && "font-bold text-secondary"
                )}
              >
                {row.getValue(right)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
